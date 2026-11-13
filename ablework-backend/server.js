const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');
const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs');
const helmet = require('helmet');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const { pipeline } = require('@huggingface/transformers');
require('dotenv').config();

const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
};

const generateEmailTemplate = (title, message) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      
      <!-- HEADER -->
      <tr>
        <td style="background-color: #03045E; padding: 25px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px;">ABLEWORK</h1>
        </td>
      </tr>
      
      <!-- BODY -->
      <tr>
        <td style="padding: 35px 30px;">
          <h2 style="color: #03045E; margin-top: 0; font-size: 20px; font-weight: 800;">${title}</h2>
          <p style="color: #444444; line-height: 1.6; font-size: 15px; margin-bottom: 30px; font-weight: 500;">
            ${message}
          </p>
          
          <!-- ACTION BUTTON -->
          <div style="text-align: center;">
            <a href="https://ablework-gamma.vercel.app/" style="background-color: #2C7FFF; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">Log In to Dashboard</a>
            </div>
        </td>
      </tr>
      
      <!-- FOOTER -->
      <tr>
        <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 2px solid #eeeeee;">
          <p style="color: #888888; font-size: 11px; margin: 0; font-weight: bold;">
            This is an automated message from the AbleWork platform. Please do not reply directly to this email.
          </p>
          <p style="color: #bbbbbb; font-size: 11px; margin: 8px 0 0 0;">
            &copy; ${new Date().getFullYear()} AbleWork. All rights reserved.
          </p>
        </td>
      </tr>
      
    </table>
  </body>
  </html>
  `;
};

async function sendNotification(userId, title, message, type) {
  try {
    let inAppMessage = message.replace(/Please log in to your AbleWork dashboard for more details\./gi, '').trim();
    if (inAppMessage.endsWith('.')) {
      inAppMessage = inAppMessage.slice(0, -1); 
    }
    
    if (type === 'match') {
      inAppMessage += '. Check your Smart Matches tab for details.';
    } else if (type === 'update' || type === 'application') {
      inAppMessage += ' Check your Job Tracker for details.';
    }

    await db.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [userId ?? null, title ?? null, inAppMessage ?? null, type ?? 'general']
    );

    const [users] = await db.execute("SELECT email FROM users WHERE id = ?", [userId ?? null]);
    
    if (users.length > 0 && users[0].email) {
      try {
        const { error } = await resend.emails.send({
          from: 'AbleWork Notifications <no-reply@ableworksystem.online>',
          to: users[0].email,
          subject: title,
          html: generateEmailTemplate(title, inAppMessage)
        });
        if (error) console.error("Resend Notification Email Error:", error);
      } catch (mailError) {
        console.error("Resend Email Dispatch Error:", mailError.message);
      }
    }
  } catch (error) {
    console.error("Failed to send notification:", error.message);
  }
}

const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();

app.use(
  helmet.crossOriginResourcePolicy({ policy: "cross-origin" })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ablework_uploads',
        resource_type: 'auto', // Allows Cloudinary to automatically detect if it's an image, raw file, or pdf
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

let extractorPromise = null;
async function getExtractor() {
    if (!extractorPromise) {
        extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractorPromise;
}



async function getUserLiveContext(userId, role) {
    let contextSummary = { role };

    try {
        if (role === 'employer') {
            const [profile] = await db.execute(
                `SELECT company_name, industry FROM employer_profiles WHERE user_id = ?`,
                [userId]
            );
            const [jobs] = await db.execute(
                `SELECT id, job_title, status, created_at FROM job_postings WHERE employer_id = ?`,
                [userId]
            );
            
            const [apps] = await db.execute(
                `SELECT a.status, COUNT(*) as count 
                 FROM applications a 
                 JOIN job_postings j ON a.job_id = j.id 
                 WHERE j.employer_id = ? 
                 GROUP BY a.status`,
                [userId]
            );

            const activeJobs = jobs.filter(j => j.status === 'Active');
            contextSummary.company = profile[0]?.company_name || 'Your Company';
            contextSummary.totalJobs = jobs.length;
            contextSummary.activeJobsCount = activeJobs.length;
            contextSummary.activeJobTitles = activeJobs.map(j => j.job_title);
            contextSummary.applicationPipeline = apps;

        } else if (role === 'applicant') {
            const [profile] = await db.execute(
                `SELECT a.firstname, a.lastname, a.skills, a.accommodations_needed, u.verification_status, u.rejection_reason 
                 FROM applicant_profiles a 
                 JOIN users u ON a.user_id = u.id 
                 WHERE a.user_id = ?`,
                [userId]
            );
            const [apps] = await db.execute(
                `SELECT j.job_title, j.company_name, a.status, a.applied_at 
                 FROM applications a 
                 JOIN job_postings j ON a.job_id = j.id 
                 WHERE a.applicant_id = ? 
                 ORDER BY a.applied_at DESC LIMIT 5`,
                [userId]
            );

            contextSummary.name = profile[0]?.firstname || 'Job Seeker';
            contextSummary.skills = JSON.parse(profile[0]?.skills || '[]');
            contextSummary.accommodations = JSON.parse(profile[0]?.accommodations_needed || '[]');
            contextSummary.verificationStatus = profile[0]?.verification_status;
            contextSummary.rejectionReason = profile[0]?.rejection_reason;
            contextSummary.recentApplications = apps;
        }
    } catch (err) {
        console.error("Error fetching live context for ABBY:", err.message);
    }

    return contextSummary;
}

// ---------------------------------------------------------
// ROUTE: Abby AI Chatbot Engine (Powered by Gemini + RAG)
// ---------------------------------------------------------
app.post('/api/chat', async (req, res) => {
    const { message, userId, role, conversationHistory = [] } = req.body;
    console.log(`Received message for Abby from ${role || 'Guest'} ${userId || ''}:`, message);

    try {
        let liveContext = {};
        if (userId && role) {
            liveContext = await getUserLiveContext(userId, role);
        }

        const today = new Date().toLocaleDateString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });

        const userContextString = liveContext && Object.keys(liveContext).length > 0 
          ? JSON.stringify(liveContext, null, 2) 
          : "GUEST USER - NOT LOGGED IN";

        const systemInstruction = `
You are Abby, the official AI assistant for AbleWork, a job application platform connecting Persons with Disabilities (PWD) to inclusive employers. 

CURRENT SYSTEM DATE: ${today}

ROLE & TONE:
- Tone: Empathetic, supportive, and highly efficient. 
- Execution: Offer exactly one brief sentence of encouragement, then immediately deliver the requested data. 
- Constraint: Be direct, concise, and strictly factual. Do not ramble. Do not invent or infer data outside of the provided context.

CURRENT LIVE DATABASE STATE FOR THIS USER:
${userContextString}

PLATFORM PROCESSES & BUSINESS LOGIC (Use this to explain how the app works):

1. REGISTRATION & VERIFICATION:
- Applicants must upload a valid PWD ID. Employers must upload Business Registration (DTI/SEC/Permit).
- Accounts are 'Pending' after registration until an Admin reviews and approves the documents.
- Users cannot apply for jobs or post jobs until their account status is 'Approved'.

2. VERIFICATION REJECTIONS & SECURITY COOLDOWNS:
- If an Admin rejects a verification document (e.g., blurry ID, expired permit), the user's account is locked.
- A strict 7-day security cooldown is enforced. The user cannot resubmit a new document until the 7 days expire.
- Once the countdown reaches 0, the user can upload a new document from their profile, resetting their status to 'Pending'.

3. THE SMART MATCHING ENGINE (How Jobs are Matched):
- Distance (Geofencing): Applicants set a max travel radius. If an employer's office is outside this radius, the job is completely hidden from the applicant.
- Accommodations (Dealbreaker): Employers must guarantee ALL accommodations an applicant requires (e.g., Wheelchair Access, Screen Reader). If one is missing, the job is not matched.
- Accepted Disabilities (Dealbreaker): Employers explicitly select which disabilities they support. The applicant's disability must be on this list to match.
- Skills (Scoring): The system calculates a match percentage based on how many of the applicant's skills match the employer's required skills.

4. JOB POSTING (For Employers):
- Employers type required skills, input guaranteed accommodations (comma-separated), and select specific disability categories they can support.
- If an employer archives a job, it completely disappears from the active UI for applicants.

5. APPLYING & TRACKING (For Applicants):
- To apply, the applicant MUST click on a specific job from their 'Explore Jobs' tab, upload a resume, and submit.
- Applications start as 'Under Review'. Employers can change the status to 'Shortlisted' or 'Rejected' and leave custom feedback messages for the applicant to read in their Job Tracker.

6. PLATFORM ACCESSIBILITY FEATURES:
- If a user struggles to read the screen, direct them to the Accessibility Toolbar (the floating blue icon at the bottom left).
- Features include a 'High Contrast' Display Theme and Font Size adjustments up to 'A++' for maximum readability.

STRICT RULES FOR ANSWERING (CRITICAL FOR EVALUATION):
1. DOMAIN LOCK: You MUST NOT answer questions unrelated to AbleWork, job searching, platform navigation, or accessibility. If asked about unrelated topics (e.g., food recipes, weather, math, general trivia), you must reply EXACTLY: "I am Abby, the AbleWork assistant. I can only answer questions related to the AbleWork platform."
2. GUEST USERS (NO HALLUCINATION): If the CURRENT LIVE DATABASE STATE says "GUEST USER - NOT LOGGED IN", the user is browsing anonymously. You MUST NOT invent a name, skills, or account status for them. Greet them simply as "there" or "Guest".
3. DATA GROUNDING: You must use the LIVE DATABASE STATE above to answer questions about the user's account, active jobs, applications, or profile. If the user asks about data not present in the LIVE DATABASE STATE, you must reply EXACTLY: "I do not currently have that information." Do not guess or provide hypothetical data.
4. DIRECT METRICS: If the user asks for a count or status (e.g., "How many active jobs do I have?"), state the exact number from the JSON data in your very first sentence.
5. CAPABILITIES: You are an informational assistant. You cannot apply to jobs, archive jobs, or approve accounts on behalf of the user. Guide them on how to do it themselves using the UI.
6. FORMATTING (PROCESSES): When asked "how to" do something or asked to explain a process (e.g., registering, applying, resetting a password), you MUST format your answer as a clean, numbered step-by-step list. Do not use block paragraphs for instructions.
        `;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash-lite", 
            systemInstruction 
        });

        const formattedHistory = conversationHistory.map(turn => ({
            role: turn.sender === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ reply: "I'm having trouble connecting right now. Please check my API connection." });
    }
});

app.get('/api/jobs', async (req, res) => {
    try {
        const [jobs] = await db.execute(`
            SELECT jp.*, u.email AS contact_email, u.phone AS contact_number, e.workplace_address
            FROM job_postings jp
            LEFT JOIN users u ON jp.employer_id = u.id
            LEFT JOIN employer_profiles e ON jp.employer_id = e.user_id
            WHERE jp.status = 'Active' 
            ORDER BY jp.created_at DESC
        `);
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Fetch All Jobs Error:", error.message);
        res.status(500).json({ error: "Failed to fetch jobs." });
    }
});

// ---------------------------------------------------------
// ROUTE: LOGIN STEP 1 (Validate Password & Send OTP)
// ---------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: "Invalid credentials." });
        const user = users[0];

        if (user.account_status === 'Disabled') {
            return res.status(403).json({ error: "This account has been disabled. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

        if (user.role === 'admin') {
            return res.status(200).json({ 
                message: "Admin login successful", 
                requiresOtp: false,
                user: { 
                    id: user.id, 
                    email: user.email, 
                    ui_preference: user.ui_preference,
                    verification_status: user.verification_status,
                    role: user.role 
                } 
            });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60000);

        await db.execute(
            "UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?",
            [otpCode, expires, user.id]
        );

        // Send OTP via Resend API
        const { error } = await resend.emails.send({
            from: 'AbleWork Security <no-reply@ableworksystem.online>',
            to: email,
            subject: "AbleWork Login Verification Code",
            html: `<p>Hello,</p><p>Your 6-digit login verification code is: <strong>${otpCode}</strong></p>`
        });

        if (error) {
            console.error("Resend API Error:", error);
        }

        res.status(200).json({ 
            message: "Credentials verified. OTP sent to email.", 
            requiresOtp: true,
            email: user.email 
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ error: "Server error during login." });
    }
});

// ---------------------------------------------------------
// ROUTE: LOGIN STEP 2 (Verify OTP & Complete Login)
// ---------------------------------------------------------
app.post('/api/auth/verify-login-otp', async (req, res) => {
    const { email, otpCode } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: "User not found." });
        const user = users[0];

        if (!user.otp_code || user.otp_code !== otpCode) {
            return res.status(401).json({ error: "Invalid verification code." });
        }

        if (new Date() > new Date(user.otp_expires)) {
            return res.status(401).json({ error: "Verification code has expired. Please log in again." });
        }

        await db.execute(
            "UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = ?",
            [user.id]
        );

        res.status(200).json({ 
            message: "Login successful", 
            user: { 
                id: user.id, 
                email: user.email, 
                ui_preference: user.ui_preference,
                verification_status: user.verification_status,
                role: user.role 
            } 
        });

    } catch (error) {
        console.error("OTP Verification Error:", error.message);
        res.status(500).json({ error: "Server error verifying OTP." });
    }
});

// ---------------------------------------------------------
// ROUTE: Fetch Applicant Profile Data
// ---------------------------------------------------------
app.get('/api/applicant/:id/profile', async (req, res) => {
    const userId = req.params.id;

    try {
        const [rows] = await db.execute(`
            SELECT 
                u.email, 
                u.phone, 
                u.verification_status,
                u.account_status,
                u.rejection_reason,
                u.rejection_timestamp,
                a.firstname, 
                a.middlename, 
                a.lastname, 
                a.birthdate, 
                a.disability_type, 
                a.residential_address,
                a.latitude, 
                a.longitude, 
                a.travel_radius_km, 
                a.workplace_independence, 
                a.accommodations_needed, 
                a.skills, 
                a.pwd_document_path,
                a.resume_path,
                a.profile_picture
            FROM users u
            JOIN applicant_profiles a ON u.id = a.user_id
            WHERE u.id = ?
        `, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Applicant profile not found." });
        }

        const profile = rows[0];

        let parsedSkills = [];
        let parsedAccommodations = [];
        
        try { parsedSkills = JSON.parse(profile.skills); } catch (e) {}
        try { parsedAccommodations = JSON.parse(profile.accommodations_needed); } catch (e) {}

        res.status(200).json({
            ...profile,
            skills: parsedSkills,
            accommodations: parsedAccommodations
        });

    } catch (error) {
        console.error("Error fetching applicant profile:", error.message);
        res.status(500).json({ message: "Server error fetching profile." });
    }
});

// ---------------------------------------------------------
// ROUTE: FULL APPLICANT REGISTRATION 
// ---------------------------------------------------------
app.post('/api/auth/register/applicant', upload.fields([
    { name: 'pwdDocument', maxCount: 2 },
    { name: 'resume', maxCount: 1 }
]), async (req, res) => {
    console.log("--- INCOMING APPLICANT REGISTRATION ---");
    
    if (!req.body) {
        return res.status(400).json({ message: "No data received. Ensure you are sending FormData." });
    }

    const { 
        firstName, middleName, lastName, email, phone, password, birthdate, 
        address, latitude, longitude, radius, 
        independence, disabilities, accommodations, skills 
    } = req.body;

    if (!isValidPassword(password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters long, with an uppercase, lowercase, number, and special character." });
    }

    let pwdDocumentPath = null;
    if (req.files && req.files['pwdDocument']) {
        const pwdFiles = req.files['pwdDocument'].map(f => f.path);
        pwdDocumentPath = pwdFiles.length === 1 ? pwdFiles[0] : JSON.stringify(pwdFiles);
    }
    const resumePath = (req.files && req.files['resume']) ? req.files['resume'][0].path : null;

    try {
        const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.execute(
                `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    email, 
                    phone, 
                    hashedPassword, 
                    'default', 
                    'Pending', 
                    'applicant'
                ]
            );

            const newUserId = userResult.insertId;
            const parsedDisabilities = JSON.parse(disabilities || '[]');
            const disabilityString = parsedDisabilities.join(', ');

            await connection.execute(
                `INSERT INTO applicant_profiles 
                (user_id, firstname, middlename, lastname, birthdate, disability_type, residential_address, latitude, longitude, travel_radius_km, workplace_independence, accommodations_needed, skills, pwd_document_path, resume_path) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newUserId, 
                    firstName, 
                    middleName || null, 
                    lastName, 
                    birthdate, 
                    disabilityString || 'None specified', 
                    address, 
                    latitude || null, 
                    longitude || null, 
                    radius || 5, 
                    independence, 
                    accommodations || '[]', 
                    skills || '[]',         
                    pwdDocumentPath,
                    resumePath         
                ]
            );

            await connection.commit();
            connection.release();

            res.status(201).json({ message: "Applicant registration successful.", userId: newUserId });

        } catch (dbError) {
            await connection.rollback();
            connection.release();
            throw dbError;
        }

    } catch (error) {
        console.error("Applicant Registration Error:", error.message);
        res.status(500).json({ message: "Database error during registration." });
    }
});

// ---------------------------------------------------------
// ROUTE: FULL EMPLOYER REGISTRATION 
// ---------------------------------------------------------
app.post('/api/auth/register/employer', upload.array('verificationDocuments', 2), async (req, res) => {
    console.log("--- INCOMING EMPLOYER REGISTRATION ---");
    
    const { 
        companyName, companyDescription, email, phone, password, industry, 
        jobRole, address, latitude, longitude 
    } = req.body;

    if (!isValidPassword(password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters long, with an uppercase, lowercase, number, and special character." });
    }

    let documentPaths = null;
    if (req.files && req.files.length > 0) {
        const pathsArray = req.files.map(file => file.path);
        documentPaths = JSON.stringify(pathsArray);
    }

    if (!documentPaths) {
        return res.status(400).json({ message: "At least one verification document is required." });
    }

    try {
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.execute(
                `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [email, phone, hashedPassword, 'default', 'Pending', 'employer']
            );

            const newUserId = userResult.insertId;

            await connection.execute(
                `INSERT INTO employer_profiles 
                (user_id, company_name, company_description, industry, job_role, workplace_address, latitude, longitude, verification_document) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newUserId, companyName, companyDescription, industry, jobRole, 
                    address, latitude || null, longitude || null, documentPaths 
                ]
            );

            await connection.commit();
            connection.release();

            res.status(201).json({ message: "Employer registration successful.", userId: newUserId });

        } catch (dbError) {
            await connection.rollback();
            connection.release();
            throw dbError;
        }

    } catch (error) {
        console.error("Employer Registration Error:", error.message);
        res.status(500).json({ message: "Database error during registration." });
    }
});

// ---------------------------------------------------------
// HELPER: Haversine Formula 
// ---------------------------------------------------------
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
}

// ---------------------------------------------------------
// HELPER: Semantic Similarity using Local Transformers.js
// ---------------------------------------------------------
async function getSemanticSimilarity(sourceText, targetTexts) {
    if (!sourceText || targetTexts.length === 0) {
        return targetTexts.map(() => 0);
    }

    try {
        const extractor = await getExtractor();

        // Generate embedding for the source text (applicant skills)
        const sourceOutput = await extractor(sourceText, { pooling: 'mean', normalize: true });
        const sourceVector = sourceOutput.data;

        const scores = [];

        for (const target of targetTexts) {
            // Generate embedding for each target text (job description / skills)
            const targetOutput = await extractor(target, { pooling: 'mean', normalize: true });
            const targetVector = targetOutput.data;

            // Calculate Cosine Similarity between source vector and target vector
            let dotProduct = 0;
            let normA = 0;
            let normB = 0;

            for (let i = 0; i < sourceVector.length; i++) {
                dotProduct += sourceVector[i] * targetVector[i];
                normA += sourceVector[i] * sourceVector[i];
                normB += targetVector[i] * targetVector[i];
            }

            const similarity = (normA === 0 || normB === 0) ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
            
            // Ensure score stays between 0 and 1
            scores.push(Math.max(0, Math.min(1, similarity)));
        }

        return scores;
    } catch (error) {
        console.error("--- LOCAL TRANSFORMERS.JS ERROR ---", error.message);
        return targetTexts.map(() => 0);
    }
}

// ---------------------------------------------------------
// ROUTE: SMART MATCHING ENGINE (Hybrid: 60% Rules, 40% AI)
// ---------------------------------------------------------
app.get('/api/applicant/:id/matches', async (req, res) => {
    const userId = req.params.id;

    try {
        const [applicantRows] = await db.execute(`
            SELECT latitude, longitude, travel_radius_km, accommodations_needed, skills, disability_type 
            FROM applicant_profiles 
            WHERE user_id = ?
        `, [userId]);

        if (applicantRows.length === 0) return res.status(404).json({ message: "Applicant not found." });
        const applicant = applicantRows[0];

        const safeParse = (data) => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            let parsed = data;
            while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                try { parsed = JSON.parse(parsed); } catch (e) { break; }
            }
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'string') {
                const cleaned = parsed.replace(/[\[\]"\\]/g, ''); 
                return cleaned.split(',').map(item => item.trim()).filter(item => item);
            }
            return [];
        };

        const appSkillsArray = safeParse(applicant.skills);
        const appSkillsString = appSkillsArray.join(", "); 
        const appAccommodations = safeParse(applicant.accommodations_needed).map(a => a.toLowerCase());
        const appDisabilities = safeParse(applicant.disability_type).map(d => d.toLowerCase()); 
        const maxRadius = Number(applicant.travel_radius_km) || 5; 

        const [jobs] = await db.execute(`
            SELECT jp.id, jp.employer_id, jp.job_title, jp.company_name, jp.job_description, 
                   jp.required_skills, jp.provided_accommodations, jp.accepted_disabilities, 
                   jp.salary_range, jp.benefits, jp.latitude, jp.longitude, jp.max_applications,
                   u.email AS contact_email, u.phone AS contact_number, e.workplace_address, e.industry
            FROM job_postings jp
            LEFT JOIN users u ON jp.employer_id = u.id
            LEFT JOIN employer_profiles e ON jp.employer_id = e.user_id
            WHERE jp.status = 'Active'
            AND (
                SELECT COUNT(*) 
                FROM applications a 
                WHERE a.job_id = jp.id AND a.status != 'Rejected'
            ) < IFNULL(jp.max_applications, 50)
        `);

        let ruleFilteredJobs = [];
        let jobDescriptionsToCompare = [];

        // --- PHASE 1: RULE-BASED MATCHING (60% WEIGHT) ---
        for (let job of jobs) {
            let distance = 0;
            let distanceScore = 60; 

            // Rule 1: Geofencing
            if (applicant.latitude && applicant.longitude && job.latitude && job.longitude) {
                distance = getDistanceFromLatLonInKm(applicant.latitude, applicant.longitude, job.latitude, job.longitude);
                if (distance > maxRadius) continue; 
                distanceScore = Math.max(0, 60 - ((distance / maxRadius) * 60));
            }

            // Rule 2: Accommodations Constraint (Dealbreaker)
            const jobAccommodations = safeParse(job.provided_accommodations).map(a => a.toLowerCase());
            const meetsAllNeeds = appAccommodations.every(need => jobAccommodations.includes(need));
            if (!meetsAllNeeds) continue; 

            // Rule 3: Disability Support (Dealbreaker)
            const jobAcceptedDisabilities = safeParse(job.accepted_disabilities).map(d => d.toLowerCase());
            const isDisabilitySupported = appDisabilities.some(disability => jobAcceptedDisabilities.includes(disability));
            if (jobAcceptedDisabilities.length > 0 && !isDisabilitySupported) continue;

            ruleFilteredJobs.push({
                ...job,
                // FIX: If distance is exactly 0, explicitly pass "0.0" so the frontend doesn't crash on null
                distance_km: distance === 0 ? "0.0" : distance.toFixed(1),
                distance_score: distanceScore
            });

            // Prepare context for Phase 2: SBERT
            const jobSkillsArray = safeParse(job.required_skills);
            const jobContext = `${job.job_title}. Required skills: ${jobSkillsArray.join(", ")}`;
            jobDescriptionsToCompare.push(jobContext);
        }

        let matchedJobs = [];
        let semanticScores = [];

        // --- PHASE 2: SEMANTIC SIMILARITY ---
        if (ruleFilteredJobs.length > 0 && appSkillsString.length > 0) {
            semanticScores = await getSemanticSimilarity(appSkillsString, jobDescriptionsToCompare);
        }

        // --- PHASE 3: HYBRID SCORE CALCULATION (40% WEIGHT) ---
        // FIX: This loop now ALWAYS runs to guarantee rule-matched jobs are returned, even if AI falls back
        for (let i = 0; i < ruleFilteredJobs.length; i++) {
            const job = ruleFilteredJobs[i];
            
            const semanticRaw = semanticScores[i] || 0;
            const semanticScore = semanticRaw * 40; 

            // Hybrid Formula: Proximity (60%) + Contextual Skills (40%)
            const overallMatchPercentage = Math.round(job.distance_score + semanticScore);

            if (overallMatchPercentage >= 50) {
                matchedJobs.push({
                    ...job,
                    match_percentage: overallMatchPercentage,
                    semantic_similarity_raw: semanticRaw.toFixed(2)
                });
            }
        }

        matchedJobs.sort((a, b) => b.match_percentage - a.match_percentage);
        res.status(200).json(matchedJobs);

    } catch (error) {
        console.error("Smart Engine Error:", error.message);
        res.status(500).json({ message: "Error running matching algorithm." });
    }
});

// ---------------------------------------------------------
// ROUTE: SUBMIT A JOB APPLICATION (With Resume Upload)
// ---------------------------------------------------------
app.post('/api/applications/apply', upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
]), async (req, res) => {

    const { applicant_id, job_id, cover_letter, use_existing_resume } = req.body;
    
    let resumePath = null;
    let certificatePath = null;

    if (use_existing_resume === 'true') {
        const [profileRows] = await db.execute(
            'SELECT resume_path FROM applicant_profiles WHERE user_id = ?',
            [applicant_id]
        );
        if (profileRows.length > 0) {
            resumePath = profileRows[0].resume_path;
        }
    } else if (req.files && req.files['resume']) {
        resumePath = req.files['resume'][0].path;
    }

    if (req.files && req.files['certificate']) {
        certificatePath = req.files['certificate'][0].path;
    }

    if (!applicant_id || !job_id) {
        return res.status(400).json({ message: "Missing applicant or job ID." });
    }

    if (!resumePath) {
        return res.status(400).json({ message: "A resume file is required to apply." });
    }

    try {
        const [userCheck] = await db.execute('SELECT IFNULL(account_status, "Active") as account_status FROM users WHERE id = ?', [applicant_id]);
        if (userCheck.length > 0 && (userCheck[0].account_status === 'Deactivated' || userCheck[0].account_status === 'Disabled')) {
            return res.status(403).json({ message: "Your account is deactivated. Please reactivate your account in Settings to apply for jobs." });
        }

        const [existing] = await db.execute(
            'SELECT id FROM applications WHERE applicant_id = ? AND job_id = ?', 
            [applicant_id, job_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "You have already applied for this job." });
        }

        const [jobCheck] = await db.execute('SELECT max_applications FROM job_postings WHERE id = ?', [job_id]);
        if (jobCheck.length === 0) {
            return res.status(404).json({ message: "Job not found." });
        }
        
        const dynamicLimit = jobCheck[0].max_applications || 50; 

        const [appCount] = await db.execute("SELECT COUNT(*) as total FROM applications WHERE job_id = ? AND status != 'Rejected'", [job_id]);
        if (appCount[0].total >= dynamicLimit) {
            return res.status(403).json({ message: `This job has reached its maximum limit of ${dynamicLimit} applications.` });
        }

        await db.execute(
            'INSERT INTO applications (applicant_id, job_id, status, resume_path, certificate_path, cover_letter) VALUES (?, ?, ?, ?, ?, ?)',
            [applicant_id, job_id, 'Received', resumePath, certificatePath, cover_letter || null] 
        );

        const [jobRows] = await db.execute(
            "SELECT employer_id, job_title FROM job_postings WHERE id = ?", 
            [job_id] 
        );
        
        if (jobRows.length > 0) {
            const employerId = jobRows[0].employer_id;
            const jobTitle = jobRows[0].job_title;

            const [appRows] = await db.execute(
                "SELECT firstname, lastname FROM applicant_profiles WHERE user_id = ?", 
                [applicant_id] 
            );
            const applicantName = appRows.length > 0 ? `${appRows[0].firstname} ${appRows[0].lastname}` : "A new candidate";

            const alertTitle = `New Application: ${jobTitle}`;
            const alertMessage = `${applicantName} has just applied for your open ${jobTitle} role! Log in to your AbleWork dashboard to review their resume and pitch.`;

            await sendNotification(employerId, alertTitle, alertMessage, 'application');
        }
        
        res.status(201).json({ message: "Application submitted successfully!" });
    } catch (error) {
        console.error("Application Submission Error:", error.message);
        res.status(500).json({ message: "Failed to submit application." });
    }
});

// ---------------------------------------------------------
// ROUTE: MARK APPLICATION AS VIEWED (UNDER REVIEW)
// ---------------------------------------------------------
app.put('/api/applications/:id/view', async (req, res) => {
    const applicationId = req.params.id;
    try {
        const [updateResult] = await db.execute(
            `UPDATE applications 
             SET status = 'Under Review' 
             WHERE id = ? AND status = 'Received'`,
            [applicationId]
        );

        if (updateResult.affectedRows > 0) {
            const [appDetails] = await db.execute(`
                SELECT a.applicant_id, j.job_title, j.company_name 
                FROM applications a
                JOIN job_postings j ON a.job_id = j.id
                WHERE a.id = ?
            `, [applicationId]);

            if (appDetails.length > 0) {
                const { applicant_id, job_title, company_name } = appDetails[0];

                const alertTitle = `Application Update: Under Review`;
                const alertMessage = `Great news! Your application for the ${job_title} role at ${company_name} has been viewed and marked as Under Review.`;

                await sendNotification(applicant_id, alertTitle, alertMessage, 'update');
            }
        }

        res.status(200).json({ message: "Status updated to Under Review and applicant notified." });
    } catch (error) {
        console.error("View Status Update Error:", error.message);
        res.status(500).json({ message: "Failed to update status." });
    }
});

// ---------------------------------------------------------
// ROUTE: FETCH APPLICANT'S TRACKER DATA
// ---------------------------------------------------------
app.get('/api/applicant/:id/applications', async (req, res) => {
    const userId = req.params.id;

    try {
        const [applications] = await db.execute(`
            SELECT 
                a.id as application_id, a.status, a.applied_at, a.employer_message, 
                j.job_title, j.company_name
            FROM applications a
            JOIN job_postings j ON a.job_id = j.id
            WHERE a.applicant_id = ?
            ORDER BY a.applied_at DESC
        `, [userId]);

        res.status(200).json(applications);
    } catch (error) {
        console.error("Tracker Fetch Error:", error.message);
        res.status(500).json({ message: "Failed to fetch applications." });
    }
});

// ---------------------------------------------------------
// ROUTE: FETCH EMPLOYER PROFILE
// ---------------------------------------------------------
app.get('/api/employer/:id/profile', async (req, res) => {
    const userId = req.params.id;

    try {
        const [rows] = await db.execute(`
            SELECT u.email, 
                   u.phone, 
                   u.verification_status, 
                   u.account_status,
                   u.rejection_reason,
                   u.rejection_timestamp,
                   e.company_name, e.industry, e.job_role, e.workplace_address,
                   e.company_description, e.latitude, e.longitude, e.company_logo,
                   e.verification_document
            FROM users u
            JOIN employer_profiles e ON u.id = e.user_id
            WHERE u.id = ?
        `, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Employer profile not found." });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Employer Profile Error:", error.message);
        res.status(500).json({ message: "Server error fetching profile." });
    }
});

// ---------------------------------------------------------
// ROUTE: FETCH EMPLOYER DASHBOARD STATS
// ---------------------------------------------------------
app.get('/api/employer/:id/dashboard-stats', async (req, res) => {
    const employerId = req.params.id;

    try {
        const [activeJobs] = await db.execute(
            `SELECT COUNT(*) as count FROM job_postings WHERE employer_id = ? AND status = 'Active'`, 
            [employerId]
        );

        const [appStats] = await db.execute(
            `SELECT 
                SUM(CASE WHEN a.status IN ('Pending', 'Received', 'Under Review') THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN a.status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted_count
             FROM applications a
             JOIN job_postings j ON a.job_id = j.id
             WHERE j.employer_id = ?`,
             [employerId]
        );

        const [recentActivity] = await db.execute(
            `SELECT a.id, a.applied_at AS created_at, a.status, j.job_title, 
                    ap.firstname AS first_name, ap.lastname AS last_name
             FROM applications a
             JOIN job_postings j ON a.job_id = j.id
             JOIN applicant_profiles ap ON a.applicant_id = ap.user_id
             WHERE j.employer_id = ?
             ORDER BY a.applied_at DESC
             LIMIT 5`,
             [employerId]
        );

        const [recentApps] = await db.execute(
            `SELECT a.applied_at 
             FROM applications a
             JOIN job_postings j ON a.job_id = j.id
             WHERE j.employer_id = ? 
               AND a.applied_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`,
             [employerId]
        );

        const chartData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - i);
            
            const dailyCount = recentApps.filter(row => {
                const rowDate = new Date(row.applied_at);
                return rowDate.getDate() === targetDate.getDate() && 
                       rowDate.getMonth() === targetDate.getMonth() &&
                       rowDate.getFullYear() === targetDate.getFullYear();
            }).length;

            chartData.push({
                name: dayNames[targetDate.getDay()], 
                applications: dailyCount
            });
        }

        const [disabilityRows] = await db.execute(
            `SELECT ap.disability_type 
             FROM applications a
             JOIN job_postings j ON a.job_id = j.id
             JOIN applicant_profiles ap ON a.applicant_id = ap.user_id
             WHERE j.employer_id = ?`,
             [employerId]
        );

        const categoryMap = {
            'Motor & Neuromuscular': ['Paraplegia (Lower Body)', 'Hemiplegia (One Side)', 'Quadriplegia (All Limbs)', 'Cerebral Palsy', 'Limited Fine Motor Skills', 'Spinal Cord Injury', 'Muscular Dystrophy', 'Spina Bifida', 'Dwarfism', 'Scoliosis', 'Multiple Sclerosis', 'Chronic Pain', 'Wheelchair User', 'Paralysis'],
            'Vision Impairments': ['Blindness', 'Total Blindness', 'Partially Blind', 'Low Vision', 'Color Blindness'],
            'Hearing & Speech': ['Deafness', 'Hard of Hearing', 'Muteness', 'Speech Impairment'],
            'Amputation': ['Upper Limb Amputation (Left)', 'Upper Limb Amputation (Right)', 'Upper Limb Amputation (Both)', 'Lower Limb Amputation (Left)', 'Lower Limb Amputation (Right)', 'Lower Limb Amputation (Both)', 'Upper Limb Amputation', 'Lower Limb Amputation', 'Amputation'],
            'Polio': ['Polio (Upper Limbs)', 'Polio (Lower Limbs)', 'Polio (One Side)', 'Polio'],
            'Deafblindness': ['Deafblindness']
        };

        const categoryCounts = {
            'Motor & Neuromuscular': 0,
            'Vision Impairments': 0,
            'Hearing & Speech': 0,
            'Amputation': 0,
            'Polio': 0,
            'Deafblindness': 0
        };

        const categoryColors = {
            'Motor & Neuromuscular': '#2C7FFF',
            'Vision Impairments': '#10B981',
            'Hearing & Speech': '#F59E0B',
            'Amputation': '#8B5CF6',
            'Polio': '#EC4899',
            'Deafblindness': '#6B7280'
        };

        let totalMatchedCategories = 0;

        disabilityRows.forEach(row => {
            if (!row.disability_type) return;
            const dStr = row.disability_type.toLowerCase();

            for (const [category, keywords] of Object.entries(categoryMap)) {
                const hasMatch = keywords.some(k => dStr.includes(k.toLowerCase()));
                if (hasMatch) {
                    categoryCounts[category]++;
                    totalMatchedCategories++;
                }
            }
        });

        let disabilityData = Object.keys(categoryCounts).map(cat => ({
            name: cat,
            value: totalMatchedCategories > 0 ? Math.round((categoryCounts[cat] / totalMatchedCategories) * 100) : 0,
            count: categoryCounts[cat],
            color: categoryColors[cat]
        }));

        disabilityData.sort((a, b) => b.value - a.value);

        res.status(200).json({
            activeJobs: activeJobs[0].count || 0,
            pendingApps: appStats[0].pending_count || 0,
            shortlistedApps: appStats[0].shortlisted_count || 0,
            recentActivity: recentActivity,
            chartData: chartData,
            disabilityData: disabilityData,
            totalDisabilitiesCount: totalMatchedCategories
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error.message);
        res.status(500).json({ message: "Server error fetching stats." });
    }
});

// ---------------------------------------------------------
// ROUTE: FETCH EMPLOYER'S JOB POSTINGS
// ---------------------------------------------------------
app.get('/api/employer/:id/jobs', async (req, res) => {
    const userId = req.params.id;

    try {
        const [jobs] = await db.execute(`
            SELECT * FROM job_postings WHERE employer_id = ? ORDER BY created_at DESC
        `, [userId]);

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Fetch Jobs Error:", error.message);
        res.status(500).json({ message: "Failed to fetch jobs." });
    }
});

// ---------------------------------------------------------
// ROUTE: CREATE A JOB (Secured & Restricted)
// ---------------------------------------------------------
app.post('/api/jobs/create', async (req, res) => {

    const { 
        employer_id, job_title, company_name, job_description, 
        required_skills, provided_accommodations, accepted_disabilities,
        salary_range, benefits, latitude, longitude,
        max_applications
    } = req.body;

    try {
        const [users] = await db.execute('SELECT verification_status, IFNULL(account_status, "Active") as account_status FROM users WHERE id = ?', [employer_id]);
        
        if (users.length === 0 || users[0].verification_status !== 'Approved') {
            return res.status(403).json({ message: "You must be an approved employer to post jobs." });
        }

        if (users[0].account_status === 'Deactivated' || users[0].account_status === 'Disabled') {
            return res.status(403).json({ message: "Your account is deactivated. Please reactivate your account in Settings to post new jobs." });
        }

        const [result] = await db.execute(
            `INSERT INTO job_postings
             (employer_id, job_title, company_name, job_description, required_skills, provided_accommodations, accepted_disabilities, salary_range, benefits, latitude, longitude, max_applications, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [
                employer_id ?? null, 
                job_title ?? null, 
                company_name ?? null, 
                job_description ?? null, 
                required_skills ? JSON.stringify(required_skills) : '[]', 
                provided_accommodations ? JSON.stringify(provided_accommodations) : '[]', 
                accepted_disabilities ? JSON.stringify(accepted_disabilities) : '[]', 
                salary_range ?? null,                       
                benefits ? JSON.stringify(benefits) : '[]', 
                latitude ?? null, 
                longitude ?? null,
                max_applications || 50
            ]
        );

        const newJobId = result.insertId;

        try {
            const [newJobRows] = await db.execute("SELECT * FROM job_postings WHERE id = ?", [newJobId]);
            if (newJobRows.length > 0) {
                const job = newJobRows[0];

                const [applicants] = await db.execute(`
                    SELECT ap.*, u.id as user_id 
                    FROM applicant_profiles ap 
                    JOIN users u ON ap.user_id = u.id 
                    WHERE u.verification_status = 'Approved'
                `);

                const safeParse = (data) => {
                    if (!data) return [];
                    if (Array.isArray(data)) return data;
                    let parsed = data;
                    while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                        try { parsed = JSON.parse(parsed); } catch (e) { break; }
                    }
                    if (Array.isArray(parsed)) return parsed;
                    if (typeof parsed === 'string') {
                        const cleaned = parsed.replace(/[\[\]"\\]/g, ''); 
                        return cleaned.split(',').map(item => item.trim()).filter(item => item);
                    }
                    return [];
                };

                const jobAccommodations = safeParse(job.provided_accommodations).map(a => a.toLowerCase());
                const jobAcceptedDisabilities = safeParse(job.accepted_disabilities).map(d => d.toLowerCase());
                const jobSkills = safeParse(job.required_skills).map(s => s.toLowerCase());

                for (let applicant of applicants) {
                    const appRadius = Number(applicant.travel_radius_km) || 5;
                    const appAccommodations = safeParse(applicant.accommodations_needed).map(a => a.toLowerCase());
                    
                    const applicantDisabilityStr = (applicant.disability_type || "").toLowerCase();
                    
                    const appSkills = safeParse(applicant.skills).map(s => s.toLowerCase());

                    let distance = 0;
                    let distanceScore = 40;
                    if (applicant.latitude && applicant.longitude && job.latitude && job.longitude) {
                        const R = 6371;
                        const dLat = (job.latitude - applicant.latitude) * (Math.PI / 180);
                        const dLon = (job.longitude - applicant.longitude) * (Math.PI / 180);
                        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                  Math.cos(applicant.latitude * (Math.PI / 180)) * Math.cos(job.latitude * (Math.PI / 180)) * 
                                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        distance = R * c;

                        if (distance > appRadius) continue;
                        distanceScore = Math.max(0, 40 - ((distance / appRadius) * 40));
                    }

                    const meetsAllNeeds = appAccommodations.every(need => jobAccommodations.includes(need));
                    if (!meetsAllNeeds) continue;

                    const isDisabilitySupported = jobAcceptedDisabilities.length === 0 || jobAcceptedDisabilities.some(d => applicantDisabilityStr.includes(d));
                    if (!isDisabilitySupported) continue;

                    let matchingSkillsCount = 0;
                    appSkills.forEach(skill => {
                        if (jobSkills.includes(skill)) matchingSkillsCount++;
                    });
                    const skillScore = jobSkills.length > 0 ? (matchingSkillsCount / jobSkills.length) * 60 : 60;
                    const overallMatchPercentage = Math.round(skillScore + distanceScore);

                    if (overallMatchPercentage >= 50) {
                        const alertTitle = `New Smart Match: ${job.job_title}`;
                        const alertMessage = `Great news! A new opening for ${job.job_title} at ${job.company_name} matches your profile with a ${overallMatchPercentage}% score.`;
                        
                        await sendNotification(applicant.user_id, alertTitle, alertMessage, 'match');
                    }
                }
            }
        } catch (matchError) {
            console.error("Smart Match Notification Error:", matchError.message);
        }
     

        res.status(201).json({ message: "Job posted successfully." });
    } catch (error) {
        console.error("Job Creation Error:", error.message);
        res.status(500).json({ message: "Server error posting job." });
    }
});

// ---------------------------------------------------------
// ROUTE: EDIT A JOB
// ---------------------------------------------------------
app.put('/api/jobs/:id', async (req, res) => {
    const jobId = req.params.id;
    const { 
        job_title, job_description, required_skills, 
        provided_accommodations, accepted_disabilities, 
        salary_range, benefits 
    } = req.body;

    try {
        await db.execute(
            `UPDATE job_postings 
             SET job_title = ?, job_description = ?, required_skills = ?, provided_accommodations = ?, accepted_disabilities = ?, salary_range = ?, benefits = ? 
             WHERE id = ?`,
            [
                job_title, 
                job_description, 
                JSON.stringify(required_skills || []), 
                JSON.stringify(provided_accommodations || []), 
                JSON.stringify(accepted_disabilities || []), 
                salary_range ?? null,
                JSON.stringify(benefits || []),
                jobId
            ]
        );
        res.status(200).json({ message: "Job updated successfully." });
    } catch (error) {
        console.error("Job Update Error:", error.message);
        res.status(500).json({ message: "Server error updating job." });
    }
});

// ---------------------------------------------------------
// ROUTE: ARCHIVE A JOB (Soft Delete)
// ---------------------------------------------------------
app.put('/api/jobs/:id/archive', async (req, res) => {
    const jobId = req.params.id;
    try {
        await db.execute(`UPDATE job_postings SET status = 'Archived' WHERE id = ?`, [jobId]);
        res.status(200).json({ message: "Job archived successfully." });
    } catch (error) {
        console.error("Archive Error:", error.message);
        res.status(500).json({ message: "Server error archiving job." });
    }
});

// ---------------------------------------------------------
// ROUTE: FETCH ALL APPLICATIONS FOR AN EMPLOYER
// ---------------------------------------------------------
app.get('/api/employer/:id/applications', async (req, res) => {
    const employerId = req.params.id;

    try {
        const [applications] = await db.execute(`
            SELECT a.id as application_id, a.applicant_id, a.status as application_status, a.applied_at,
                   a.resume_path, a.certificate_path, a.cover_letter, 
                   j.job_title, j.id as job_id,
                   ap.firstname, ap.lastname, ap.skills, ap.accommodations_needed, ap.disability_type,
                   u.email, u.phone
            FROM applications a
            JOIN job_postings j ON a.job_id = j.id
            JOIN applicant_profiles ap ON a.applicant_id = ap.user_id
            JOIN users u ON ap.user_id = u.id
            WHERE j.employer_id = ?
            ORDER BY a.applied_at DESC
        `, [employerId]);

        res.status(200).json(applications);
    } catch (error) {
        console.error("Fetch Applications Error:", error.message);
        res.status(500).json({ message: "Server error fetching applications." });
    }
});

// ---------------------------------------------------------
// ROUTE: UPDATE APPLICATION STATUS & ADD NEXT STEPS
// ---------------------------------------------------------
app.put('/api/applications/:id/status', async (req, res) => {
    const applicationId = req.params.id;
    const { status, employer_message, applicant_id, job_title, company_name } = req.body; 

    try {
        await db.execute(
            "UPDATE applications SET status = ?, employer_message = ? WHERE id = ?", 
            [status, employer_message || null, applicationId]
        );

        if (status === 'Hired') {
            const [appRows] = await db.execute('SELECT job_id FROM applications WHERE id = ?', [applicationId]);
            if (appRows.length > 0) {
                const jobId = appRows[0].job_id;
                
                await db.execute("UPDATE job_postings SET status = 'Archived' WHERE id = ?", [jobId]);
                
                await db.execute(
                    "UPDATE applications SET status = 'Rejected', employer_message = 'The position has been filled.' WHERE job_id = ? AND id != ?",
                    [jobId, applicationId]
                );
            }
        }

        const alertTitle = `Application Status Update: ${status}`;
        const alertMessage = `Hello! Your application for the ${job_title} role at ${company_name} has been marked as ${status}. Please log in to your AbleWork dashboard for more details.`;
        
        await sendNotification(applicant_id, alertTitle, alertMessage, 'update');

        res.status(200).json({ message: "Status updated and applicant notified!" });
    } catch (error) {
        console.error("Status Update Error:", error.message);
        res.status(500).json({ error: "Failed to update status." });
    }
});

// ---------------------------------------------------------
// ROUTE: UPDATE EMPLOYER PROFILE & LOGO
// ---------------------------------------------------------
app.put('/api/employer/:id/settings', upload.single('company_logo'), async (req, res) => {
    const userId = req.params.id;
    const { company_name, company_description, industry, email, latitude, longitude } = req.body;
    const company_logo = req.file ? req.file.path : null;

    try {
        await db.execute(`UPDATE users SET email = ? WHERE id = ?`, [email, userId]);

        if (company_logo) {
            await db.execute(
                `UPDATE employer_profiles 
                 SET company_name = ?, company_description = ?, industry = ?, latitude = ?, longitude = ?, company_logo = ? 
                 WHERE user_id = ?`,
                [company_name, company_description, industry, latitude, longitude, company_logo, userId]
            );
        } else {
            await db.execute(
                `UPDATE employer_profiles 
                 SET company_name = ?, company_description = ?, industry = ?, latitude = ?, longitude = ? 
                 WHERE user_id = ?`,
                [company_name, company_description, industry, latitude, longitude, userId]
            );
        }

        res.status(200).json({ message: "Profile updated successfully", logo_url: company_logo });
    } catch (error) {
        console.error("Settings Update Error:", error.message);
        res.status(500).json({ message: "Server error updating profile." });
    }
});

// ---------------------------------------------------------
// ROUTE: UPDATE APPLICANT PROFILE
// ---------------------------------------------------------
app.put('/api/applicant/:id/profile', upload.single('profile_picture'), async (req, res) => {
    const userId = req.params.id;
    const { 
        residential_address, latitude, longitude, travel_radius_km, 
        workplace_independence, accommodations_needed, skills, disability_type 
    } = req.body;

    const profile_picture = req.file ? req.file.path : null;

    try {
        if (profile_picture) {
            await db.execute(
                `UPDATE applicant_profiles 
                 SET residential_address = ?, latitude = ?, longitude = ?, travel_radius_km = ?, 
                     workplace_independence = ?, accommodations_needed = ?, skills = ?, disability_type = ?, profile_picture = ? 
                 WHERE user_id = ?`,
                [
                    residential_address, 
                    latitude || null, 
                    longitude || null, 
                    travel_radius_km, 
                    workplace_independence, 
                    accommodations_needed, 
                    skills,                
                    disability_type,
                    profile_picture,
                    userId
                ]
            );
        } else {
            await db.execute(
                `UPDATE applicant_profiles 
                 SET residential_address = ?, latitude = ?, longitude = ?, travel_radius_km = ?, 
                     workplace_independence = ?, accommodations_needed = ?, skills = ?, disability_type = ? 
                 WHERE user_id = ?`,
                [
                    residential_address, 
                    latitude || null, 
                    longitude || null, 
                    travel_radius_km, 
                    workplace_independence, 
                    accommodations_needed, 
                    skills,                
                    disability_type,
                    userId
                ]
            );
        }
        res.status(200).json({ message: "Profile updated successfully.", profile_picture });
    } catch (error) {
        console.error("Profile Update Error:", error.message);
        res.status(500).json({ message: "Server error updating profile." });
    }
});

// =========================================================
//                  ADMIN PANEL ROUTES
// =========================================================
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [applicantCount] = await db.execute(`SELECT COUNT(*) as count FROM applicant_profiles`);
        const [employerCount] = await db.execute(`SELECT COUNT(*) as count FROM employer_profiles`);
        
        const [activeJobs] = await db.execute(`SELECT COUNT(*) as count FROM job_postings WHERE status = 'Active'`);
        const [pendingEmpVerifications] = await db.execute(`SELECT COUNT(*) as count FROM users WHERE role = 'employer' AND verification_status = 'Pending'`);
        const [pendingAppVerifications] = await db.execute(`SELECT COUNT(*) as count FROM users WHERE role = 'applicant' AND verification_status = 'Pending'`);

        res.status(200).json({
            totalApplicants: applicantCount[0].count,
            totalEmployers: employerCount[0].count,
            activeJobs: activeJobs[0].count,
            pendingEmployers: pendingEmpVerifications[0].count,
            pendingApplicants: pendingAppVerifications[0].count
        });
    } catch (error) {
        console.error("Admin Stats Error:", error.message);
        res.status(500).json({ message: "Failed to fetch admin statistics." });
    }
});


app.get('/api/admin/employers/all', async (req, res) => {
    try {
        const [employers] = await db.execute(`
            SELECT u.id as user_id, u.email, u.created_at, u.verification_status, IFNULL(u.account_status, 'Active') as account_status, u.reverification_attempts,
                   e.company_name, e.industry, e.verification_document
            FROM users u
            JOIN employer_profiles e ON u.id = e.user_id
            WHERE u.role = 'employer'
            ORDER BY u.created_at DESC
        `);
        res.status(200).json(employers);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch employers." });
    }
});


app.get('/api/admin/applicants/all', async (req, res) => {
    try {
        const [applicants] = await db.execute(`
            SELECT u.id as user_id, u.email, u.created_at, u.verification_status, IFNULL(u.account_status, 'Active') as account_status, u.reverification_attempts,
                   a.firstname, a.lastname, a.disability_type, a.pwd_document_path
            FROM users u
            JOIN applicant_profiles a ON u.id = a.user_id
            WHERE u.role = 'applicant'
            ORDER BY u.created_at DESC
        `);
        res.status(200).json(applicants);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch applicants." });
    }
});


app.put('/api/admin/users/:id/verify', async (req, res) => {
    const { id } = req.params;
    const { status, rejection_reason } = req.body; 

    try {

        if (status === 'Rejected') {
            await db.execute(
                `UPDATE users SET verification_status = ?, rejection_reason = ?, rejection_timestamp = NOW() WHERE id = ?`,
                [status, rejection_reason, id]
            );
        } else {
            await db.execute(
                `UPDATE users SET verification_status = ?, rejection_reason = NULL, rejection_timestamp = NULL WHERE id = ?`,
                [status, id]
            );
        }
        

        let alertTitle = '';
        let alertMessage = '';

        if (status === 'Approved') {
            alertTitle = 'AbleWork System: Account Verification Update';
            alertMessage = 'Your submitted verification documents have been reviewed and approved by the administration team. Your account standing is now Active. You may now access all platform features.';
        } else if (status === 'Rejected') {
            alertTitle = 'AbleWork System: Verification Document Issue';
            alertMessage = `Your recent verification document was not approved. Reason: ${rejection_reason || 'Did not meet platform standards'}. Please log in to your dashboard to review the feedback and resubmit.`;
        }

        if (alertTitle && alertMessage) {
            console.log(`Attempting to send email alert to User ID: ${id}`);
            await sendNotification(id, alertTitle, alertMessage, 'system');
        }
        
        res.status(200).json({ message: `User status updated to ${status} and notified.` });
    } catch (error) {
        console.error("Verification Error:", error.message);
        res.status(500).json({ message: "Error updating user status." });
    }
});


app.put('/api/admin/users/:id/account-status', async (req, res) => {
    const userId = req.params.id;
    const { account_status } = req.body;
    try {
        await db.execute(`UPDATE users SET account_status = ? WHERE id = ?`, [account_status, userId]);
        res.status(200).json({ message: `Account is now ${account_status}.` });
    } catch (error) {
        res.status(500).json({ message: "Failed to update account status." });
    }
});
//---------------------------------------------------------
// ROUTE: Create Admin Account
// ---------------------------------------------------------
app.get('/api/setup-admin', async (req, res) => {
    try {
        const adminEmail = "admin@ablework.com";
        const adminPassword = "admin123"; 
        
       
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [adminEmail]);
        if (existing.length > 0) {
            return res.status(200).json({ message: "Admin already exists!" });
        }

   
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
    
        await db.execute(
            `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status, role) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [adminEmail, '000-000-0000', hashedPassword, 'default', 'Approved', 'admin']
        );

        res.status(201).json({ message: "Admin account created successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create admin" });
    }
});

// ---------------------------------------------------------
// ROUTE: ADMIN ANNUAL ANALYTICS (Users Only)
// ---------------------------------------------------------
app.get('/api/admin/analytics/annual', async (req, res) => {
    try {
        const [userGrowth] = await db.execute(`
            SELECT MONTH(created_at) as month, COUNT(*) as total 
            FROM users 
            WHERE YEAR(created_at) = YEAR(CURDATE())
            GROUP BY MONTH(created_at)
            ORDER BY month
        `);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedData = months.map((month, index) => {
            const userStat = userGrowth.find(u => u.month === index + 1);
            return {
                name: month,
                users: userStat ? userStat.total : 0
            };
        });

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Analytics Error:", error.message);
        res.status(500).json({ message: "Error fetching analytics." });
    }
});

// ---------------------------------------------------------
// ROUTE: GET POPULAR SKILLS FROM EMPLOYER POSTINGS
// ---------------------------------------------------------
app.get('/api/skills/popular', async (req, res) => {
    try {
        const [jobs] = await db.execute(`
            SELECT required_skills 
            FROM job_postings 
            WHERE status = 'Active'
        `);
        
        const safeParse = (data) => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            let parsed = data;
            while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                try { parsed = JSON.parse(parsed); } catch (e) { break; }
            }
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'string') {
                const cleaned = parsed.replace(/[\[\]"\\]/g, ''); 
                return cleaned.split(',').map(item => item.trim()).filter(item => item);
            }
            return [];
        };

        let skillCounts = {};
        
        jobs.forEach(job => {
            const skills = safeParse(job.required_skills);
            
            skills.forEach(skill => {
                if (skill) {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                }
            });
        });

        const sortedSkills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);

        res.status(200).json(sortedSkills);
    } catch (error) {
        console.error("Fetch Skills Error:", error.message);
        res.status(500).json({ message: "Error fetching popular skills." });
    }
});

// ---------------------------------------------------------
// ROUTE: USER RESUBMIT VERIFICATION DOCUMENT
// ---------------------------------------------------------
app.post('/api/users/:id/resubmit', upload.array('document', 2), async (req, res) => {
    const userId = req.params.id;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        if (clientIp) {
            const [ipCheck] = await db.execute(
                'SELECT SUM(reverification_attempts) as total_attempts FROM users WHERE ip_address = ?', 
                [clientIp]
            );
            const attempts = ipCheck[0].total_attempts || 0;
            if (attempts >= 3) {
                return res.status(403).json({ 
                    message: "Security Lock: Maximum reverification attempts (3) reached for your network. Please contact support." 
                });
            }
        }

        const [userRows] = await db.execute(`
            SELECT verification_status, rejection_timestamp, role 
            FROM users 
            WHERE id = ?
        `, [userId]);

        if (userRows.length === 0) return res.status(404).json({ message: "User not found." });
        const user = userRows[0];

        if (user.verification_status === 'Rejected' && user.rejection_timestamp) {
            const rejectionDate = new Date(user.rejection_timestamp);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - rejectionDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays <= 7) {
                const daysLeft = 8 - diffDays; 
                return res.status(403).json({ 
                    message: `Security Lock: You must wait ${daysLeft} more day(s) before resubmitting your document.` 
                });
            }
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No document file provided." });
        }

        if (user.role === 'applicant') {
            const filePath = req.files[0].path;
            await db.execute(`
                UPDATE applicant_profiles 
                SET pwd_document_path = ? 
                WHERE user_id = ?
            `, [filePath, userId]);
        } else {
            const pathsArray = req.files.map(file => file.path);
            const documentPaths = JSON.stringify(pathsArray);
            await db.execute(`
                UPDATE employer_profiles 
                SET verification_document = ? 
                WHERE user_id = ?
            `, [documentPaths, userId]);
        }
        
        await db.execute(`
            UPDATE users 
            SET verification_status = 'Pending', 
                rejection_reason = NULL, 
                rejection_timestamp = NULL,
                ip_address = ?,
                reverification_attempts = reverification_attempts + 1
            WHERE id = ?
        `, [clientIp, userId]);

        res.status(200).json({ message: "Document(s) resubmitted successfully. Your account is back under review." });

    } catch (error) {
        console.error("Resubmit Error:", error.message);
        res.status(500).json({ message: "Error processing document." });
    }
});

// ---------------------------------------------------------
// ROUTE: UPDATE APPLICANT CREDENTIALS & SECURITY
// ---------------------------------------------------------
app.put('/api/applicant/:id/credentials', async (req, res) => {
    const userId = req.params.id;
    const { email, currentPassword, newPassword } = req.body;

    try {
        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: "User not found." });
        const user = users[0];


        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect current password." });
            }
            
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);
            return res.status(200).json({ message: "Password updated successfully." });
        } 
        
        if (email && !newPassword) {
            await db.execute('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
            return res.status(200).json({ message: "Email updated successfully." });
        }

        res.status(400).json({ message: "No valid updates provided." });
    } catch (error) {
        console.error("Credentials Update Error:", error.message);
        res.status(500).json({ message: "Server error updating credentials." });
    }
});


// ---------------------------------------------------------
// ROUTE: UPDATE EMPLOYER CREDENTIALS & SECURITY
// ---------------------------------------------------------
app.put('/api/employer/:id/credentials', async (req, res) => {
    const userId = req.params.id;
    const { email, currentPassword, newPassword } = req.body;

    try {
        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: "User not found." });
        const user = users[0];


        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect current password." });
            }
            
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);
            return res.status(200).json({ message: "Password updated successfully." });
        } 
        

        if (email && !newPassword) {
            await db.execute('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
            return res.status(200).json({ message: "Email updated successfully." });
        }

        res.status(400).json({ message: "No valid updates provided." });
    } catch (error) {
        console.error("Credentials Update Error:", error.message);
        res.status(500).json({ message: "Server error updating credentials." });
    }
});

// ---------------------------------------------------------
// ROUTE: DEACTIVATE ACCOUNT (Soft Disable)
// ---------------------------------------------------------
app.put('/api/users/:id/deactivate', async (req, res) => {
    const userId = req.params.id;
    try {
        await db.execute(`UPDATE users SET account_status = 'Disabled' WHERE id = ?`, [userId]);
        res.status(200).json({ message: "Account has been deactivated." });
    } catch (error) {
        res.status(500).json({ message: "Failed to deactivate account." });
    }
});

// ---------------------------------------------------------
// ROUTE: DELETE ACCOUNT (Strict Permanent Deletion)
// ---------------------------------------------------------
app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { password } = req.body;

    try {
        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: "User not found." });

        const isMatch = await bcrypt.compare(password, users[0].password_hash);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password. Deletion aborted." });

        await db.execute('DELETE FROM applicant_profiles WHERE user_id = ?', [userId]);
        await db.execute('DELETE FROM employer_profiles WHERE user_id = ?', [userId]);
        await db.execute('DELETE FROM users WHERE id = ?', [userId]);

        res.status(200).json({ message: "Account permanently deleted." });
    } catch (error) {
        console.error("Deletion Error:", error.message);
        res.status(500).json({ message: "Server error deleting account." });
    }
});

// ---------------------------------------------------------
// ROUTE: Fetch Applicant's Notifications
// ---------------------------------------------------------
app.get('/api/users/:id/notifications', async (req, res) => {
    try {
        const [notifications] = await db.execute(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", 
            [req.params.id]
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications." });
    }
});

// ---------------------------------------------------------
// ROUTE: Mark Notification as Read
// ---------------------------------------------------------
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        await db.execute("UPDATE notifications SET is_read = TRUE WHERE id = ?", [req.params.id]);
        res.status(200).json({ message: "Marked as read." });
    } catch (error) {
        res.status(500).json({ error: "Failed to update notification." });
    }
});

app.post('/api/users/:id/request-otp', async (req, res) => {
    const userId = req.params.id;
    const { email, type } = req.body;

    try {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60000); 

        await db.execute(
            "UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?",
            [otpCode, expires, userId]
        );

        const subjectLine = type === 'email' ? 'Verify your new Email Address' : 'Verify your Password Change';
        const messageBody = `<p>Hello!</p><p>Your 6-digit AbleWork verification code is: <strong>${otpCode}</strong></p><p>This code will expire in 15 minutes. If you did not request this change, please ignore this email.</p>`;

        const { error } = await resend.emails.send({
            from: 'AbleWork Security <no-reply@ableworksystem.online>',
            to: email,
            subject: subjectLine,
            html: messageBody
        });

        if (error) {
            console.error("Resend API Error:", error);
        }

        res.status(200).json({ message: "Verification code sent successfully." });

    } catch (error) {
        console.error("Failed to generate OTP:", error.message);
        res.status(500).json({ message: "Server error sending verification code." });
    }
});

// ---------------------------------------------------------
// ROUTE: TOGGLE ACCOUNT ACTIVATION/DEACTIVATION
// ---------------------------------------------------------
app.put('/api/users/:id/toggle-status', async (req, res) => {
    const userId = req.params.id;
    const { action } = req.body; 

    try {
        const newStatus = action === 'deactivate' ? 'Deactivated' : 'Active';

        await db.execute(
            "UPDATE users SET account_status = ? WHERE id = ?",
            [newStatus, userId]
        );

        const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
            
        if (users.length > 0) {
            const role = users[0].role;
            
            if (role === 'employer') {
                if (newStatus === 'Deactivated') {
                    await db.execute(
                        "UPDATE job_postings SET status = 'Hidden' WHERE employer_id = ? AND status = 'Active'", 
                        [userId]
                    );
                } else if (newStatus === 'Active') {
                    await db.execute(
                        "UPDATE job_postings SET status = 'Active' WHERE employer_id = ? AND status = 'Hidden'", 
                        [userId]
                    );
                }
            } 
            else if (role === 'applicant' && newStatus === 'Deactivated') {
                await db.execute(
                    "UPDATE applications SET status = 'Withdrawn', employer_message = 'Applicant deactivated their account.' WHERE applicant_id = ? AND status IN ('Received', 'Under Review')", 
                    [userId]
                );
            }
        }

        res.status(200).json({ 
            message: `Account successfully ${newStatus.toLowerCase()}.`,
            status: newStatus
        });
    } catch (error) {
        console.error("Toggle Status Error:", error.message);
        res.status(500).json({ message: "Server error toggling account status." });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: "No account found with that email address." });
        
        const userId = users[0].id;
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60000);

        await db.execute(
            "UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?",
            [otpCode, expires, userId]
        );

        const { error } = await resend.emails.send({
            from: 'AbleWork Security <no-reply@ableworksystem.online>',
            to: email,
            subject: 'AbleWork Password Reset Code',
            html: `<p>Hello,</p><p>We received a request to reset your AbleWork password.</p><p>Your 6-digit recovery code is: <strong>${otpCode}</strong></p><p>This code will expire in 15 minutes. If you did not request this change, please ignore this email.</p>`
        });

        if (error) {
            console.error("Resend API Error:", error);
        }

        res.status(200).json({ message: "Recovery code sent to your email!" });
    } catch (error) {
        console.error("Forgot Password Error:", error.message);
        res.status(500).json({ message: "Server error sending recovery code." });
    }
});

// ---------------------------------------------------------
// ROUTE: RESET PASSWORD (Verify OTP & Update DB)
// ---------------------------------------------------------
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otpCode, newPassword } = req.body;
    try {
        const [users] = await db.execute('SELECT id, otp_code, otp_expires FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: "User not found." });
        
        const user = users[0];
        
        if (user.otp_code !== otpCode) return res.status(400).json({ message: "Invalid recovery code." });
        
        if (new Date() > new Date(user.otp_expires)) {
            return res.status(400).json({ message: "Recovery code has expired. Please request a new one." });
        }

        if (!isValidPassword(newPassword)) {
            return res.status(400).json({ message: "New password must be at least 8 characters long, with an uppercase, lowercase, number, and special character." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.execute(
            "UPDATE users SET password_hash = ?, otp_code = NULL, otp_expires = NULL WHERE id = ?",
            [hashedPassword, user.id]
        );

        res.status(200).json({ message: "Password successfully reset!" });
    } catch (error) {
        console.error("Reset Password Error:", error.message);
        res.status(500).json({ message: "Server error resetting password." });
    }
});

// ---------------------------------------------------------
// ROUTE: VERIFY USER PASSWORD (Security Check)
// ---------------------------------------------------------
app.post('/api/users/:id/verify-password', async (req, res) => {
    const userId = req.params.id;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is required." });
    }

    try {
        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, users[0].password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password." });
        }

        res.status(200).json({ message: "Password verified successfully." });
        
    } catch (error) {
        console.error("Password Verification Error:", error.message);
        res.status(500).json({ message: "Server error verifying password." });
    }
});

// ---------------------------------------------------------
// ROUTE: APPLICANT WITHDRAW APPLICATION
// ---------------------------------------------------------
app.put('/api/applications/:id/withdraw', async (req, res) => {
    const applicationId = req.params.id;
    try {
        const [updateResult] = await db.execute(
            `UPDATE applications 
             SET status = 'Withdrawn', employer_message = 'You have withdrawn this application.' 
             WHERE id = ? AND status NOT IN ('Hired', 'Rejected')`,
            [applicationId]
        );

        if (updateResult.affectedRows > 0) {
            res.status(200).json({ message: "Application successfully withdrawn." });
        } else {
            res.status(400).json({ message: "Cannot withdraw this application. It may have already been finalized." });
        }
    } catch (error) {
        console.error("Withdraw Error:", error.message);
        res.status(500).json({ message: "Failed to withdraw application." });
    }
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server is officially running on http://localhost:${PORT}`);
});