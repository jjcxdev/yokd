import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MDXComponents } from "@/app/components/MDXComponents";

const markdownContent = `
# Privacy Policy for YOKD

###### Last updated: January 17, 2025

This Privacy Policy is governed by the laws of Canada, including the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy laws.

## Introduction

Welcome to YOKD ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our workout training application.

## Information We Collect

### Account Information
When you create a YOKD account, we collect:
- Email address
- Username
- Authentication information from social accounts when you choose to sign in through OAuth providers

### Workout Data
We collect and store information about your workout sessions, including:
- Exercise types and details
- Workout duration
- Performance metrics
- Progress tracking data

### Technical Information
Our application uses several third-party service providers:
- [Clerk](https://clerk.com/) for authentication
- [Vercel](https://vercel.com) for hosting
- [Turso](https://turso.tech) for data storage

Each of these providers has their own privacy policy governing what information they collect and how they use it. We encourage you to review their respective privacy policies to understand their practices.

## How We Use Your Information

We use your information to:
1. Provide and maintain our services
2. Track and analyze your workout progress
3. Authenticate your identity and maintain account security
4. Improve our app's functionality and user experience
5. Communicate with you about your account and updates

## Data Storage and Security

We use industry-standard security measures to protect your personal information. Your data is primarily stored using Turso, a secure database service. Access to your data is strictly controlled and limited to only what is necessary to provide our services. We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
- Encryption of data in transit and at rest
- Regular security assessments and updates
- Secure access controls and authentication
- Monitoring for unauthorized access attempts

Our application is hosted on Vercel's infrastructure, which provides additional security measures and compliance standards.

## Data Sharing

We do not sell your personal information to third parties or data brokers. We may share your information only in the following circumstances:
- With third-party service providers who assist in operating our app (such as Clerk for authentication)
- When required by law or to protect our legal rights
- With your explicit consent

## Third-Party Services

Our app uses Clerk for user authentication and session management. Please review Clerk's privacy policy to understand how they process your data.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Export your workout data
- Opt-out of non-essential communications

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any material changes through the app or via email.

## Contact Us

If you have any questions or concerns about our Privacy Policy or data practices, please contact us at [j@jjcx.dev](mailto:j@jjcx.dev).

## Cookie Policy

Our app may use cookies and similar tracking technologies to improve user experience and app functionality. You can control cookie preferences through your device settings.

## Children's Privacy

Our service is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.

## International Data Transfers

YOKD is based in Canada and operates under Canadian privacy laws. Your information may be transferred to and processed in various locations due to our use of third-party services:
- Turso for database storage
- GitHub for code repository hosting
- Vercel for application hosting and deployment
- Clerk for authentication services

These transfers are necessary for providing our services. We ensure appropriate safeguards are in place to protect your information in accordance with Canadian privacy laws and regulations.

## Data Retention

We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time.`;

export default function Privacy() {
  return (
    <div className="flex w-full justify-center px-2 pb-20">
      <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto w-full max-w-5xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MDXComponents}>
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
