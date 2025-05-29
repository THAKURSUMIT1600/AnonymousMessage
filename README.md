# AnonymousMessage (True Feedback)

**AnonymousMessage** is a secure and interactive messaging platform that allows users to receive messages while keeping the sender's identity hidden. It ensures privacy, promotes open communication, and offers optional user verification for enhanced security.

## Features
- **Anonymous Messaging:** Users can receive messages without knowing the sender.
- **Secure & Private:** Messages are securely stored and protected.
- **User-Friendly Dashboard:** Clean and simple interface for managing messages.
- **Optional Verification:** Users can choose to verify themselves for added trust.
- **Spam & Abuse Protection:** Reporting and blocking mechanisms to prevent misuse.

## Tech Stack
- **Frontend & Backend:** Next.js for a seamless full-stack experience.
- **Database:** MongoDB for secure data storage.
- **Authentication:** NextAuth
- **Email Services:** Resend API for email notifications.
- **Hosting & Deployment:** Vercel for both frontend and API routes.

## Installation
1. **Clone the repository:**  
   ```bash
   git clone https://github.com/THAKURSUMIT1600/AnonymousMessage.git
   ```
2. **Navigate to the project directory:**  
   ```bash
   cd AnonymousMessage
   ```
3. **Install dependencies:**  
   ```bash
   npm install
   ```
4. **Set up environment variables:**  
   - Create a `.env.local` file in the root directory.
   - Add required variables such as database connection string, JWT secret, and API keys.
   
   Example `.env.local` file:
   ```env
   MONGODB_URI="your-mongodb-connection-string"
   RESEND_API_KEY="your-resend-api-key"
   NEXT_AUTH_SECRET="your-next-auth-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GEMINI_API_KEY="your-gemini-api-key"
   ```
   **Environment Variables Description:**
   - **MONGODB_URI:** Connection string for MongoDB database.
   - **RESEND_API_KEY:** API key for sending email notifications using Resend.
   - **NEXT_AUTH_SECRET:** Secret key used for NextAuth authentication.
   - **GOOGLE_CLIENT_ID:** OAuth client ID for Google authentication.
   - **GOOGLE_CLIENT_SECRET:** Secret key for Google OAuth authentication.
   - **GEMINI_API_KEY:** API key for Gemini AI integration.

5. **Run the project in development mode:**  
   ```bash
   npm run dev
   ```

## Usage
- Users can sign up or log in (if authentication is enabled).
- Once logged in, they can receive anonymous messages through their dashboard.
- Optional settings allow message filtering, blocking, and reporting.


## Contributing
Contributions are welcome! Feel free to fork the repository, make improvements, and submit a pull request.


## Contact
For any queries, feel free to reach out to [sumitthakur16000@gmail.com] or open an issue in the repository.

