# Subject Schedule App

This project is a Student Schedule Manager built with Next.js and Firebase. It allows users to manage their classes, assignments, and reminders effectively.

## Project Structure

- **app/**: Contains the main application files.
  - **firebase.js**: Initializes the Firebase app and exports the instance.
  - **globals.css**: Global CSS styles using Tailwind CSS.
  - **layout.tsx**: Root layout component for the application.
  - **page.tsx**: Main component managing subjects, assignments, and reminders.
  
- **public/**: Directory for static assets (images, fonts, etc.).

- **components.json**: Configuration for project components and Tailwind CSS settings.

- **package.json**: npm configuration file listing dependencies and scripts.

- **package-lock.json**: Locks the versions of installed dependencies.

- **firebase.json**: Configuration settings for Firebase Hosting.

- **.firebaserc**: Firebase project configuration settings.

- **next.config.js**: Configuration settings for the Next.js application.

- **tailwind.config.js**: Configuration settings for Tailwind CSS.

## Deployment Instructions

To deploy this project to Firebase Hosting, follow these steps:

1. Install Firebase CLI globally if not already installed:
   ```
   npm install -g firebase-tools
   ```

2. Run the following command to authenticate with your Firebase account:
   ```
   firebase login
   ```

3. Initialize Firebase Hosting in your project:
   ```
   firebase init
   ```
   Select the appropriate Firebase project and configure the public directory (usually set to "public").

4. Ensure that `firebase.json` points to the correct public directory.

5. Build your Next.js application:
   ```
   npm run build
   ```

6. Deploy your application:
   ```
   firebase deploy
   ```

## Usage

After deployment, you can access your Student Schedule Manager application via the Firebase Hosting URL provided during the deployment process.