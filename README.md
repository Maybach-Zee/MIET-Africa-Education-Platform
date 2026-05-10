# MIET Africa Educational Technology Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Phase](https://img.shields.io/badge/phase-Requirements-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

A comprehensive digital solution for MIET Africa, a South African NGO dedicated to improving educational outcomes for children and youth in vulnerable communities. This platform connects teachers, students, administrators, and donors through two integrated applications.

## 🎬 Demo

<video src="./docs/media/ios-demo-resized.mp4" width="360" controls>
  Your browser does not support the video tag.
</video>

## 📋 Overview

MIET Africa works with hundreds of under-resourced schools across South Africa, but faces significant operational challenges: rural teacher isolation, paper-based tracking, communication breakdowns, and limited donor visibility. This platform addresses these gaps with:

- **Mobile Application**: For teachers and students in remote areas - offline-first learning resources, literacy assessments, and professional development
- **Web Application**: For administrators and donors - real-time analytics, school management, content publishing, and impact reporting

## 🎯 Core Impact

Every feature is designed to directly benefit vulnerable South African children:

| Problem | Solution | Child Benefit |
|---------|----------|---------------|
| Untrained teachers | Mobile training modules | Better daily instruction |
| No learning materials | Offline resource library | Quality lessons without internet |
| Undetected struggling learners | Literacy assessment tool | Early intervention |
| Language barriers | Multilingual support (Zulu, Xhosa, Afrikaans, English) | Learning in home language |
| Isolated teachers | Push notifications & messaging | Supported educators |
| Unmeasured progress | Student analytics | Tracked and celebrated growth |

## 📱 Features

### Mobile Application
- **FR-M01**: Secure user registration and authentication
- **FR-M02**: Offline learning resource library (lesson plans, videos, worksheets)
- **FR-M03**: Student progress tracker with visual analytics
- **FR-M04**: Literacy assessment tool with instant categorization
- **FR-M05**: Teacher professional development modules with certificates
- **FR-M06**: Push notifications for announcements and alerts
- **FR-M07**: Multilingual interface (English, isiZulu, isiXhosa, Afrikaans)
- **FR-M08**: Full offline mode with automatic sync

### Web Application
- **FR-W01**: Real-time admin dashboard with analytics
- **FR-W02**: Resource upload and content management workflow
- **FR-W03**: School and teacher registration portal with approval system
- **FR-W04**: Automated impact reporting for donors
- **FR-W05**: Event and training schedule management
- **FR-W06**: Public donor/volunteer portal with impact statistics

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile Frontend | SwiftUI (iOS native) | Native iOS application (iOS 26+) |
| Web Frontend | React.js | Admin dashboard and public pages |
| Backend API | Node.js with Express | RESTful API services |
| Database | PostgreSQL | User, school, and student data |
| File Storage | AWS S3 / Cloudinary | Educational resources (PDFs, videos) |
| Authentication | JWT | Secure user sessions |
| Offline Storage | Core Data (iOS) | Local device storage with automatic sync |
| Push Notifications | Firebase Cloud Messaging | Mobile alerts |
| Cloud Hosting | AWS / Vercel | Scalable infrastructure |
| Version Control | GitHub | Code repository and collaboration |

## 📊 Non-Functional Requirements

- **Performance**: Mobile app loads in <3 seconds on a standard iOS device
- **Offline Capability**: Core features function without internet
- **Security**: AES-256 encryption at rest; HTTPS/TLS in transit
- **Scalability**: Supports 10,000+ concurrent users
- **Usability**: Intuitive for users with limited smartphone experience
- **Accessibility**: WCAG 2.1 AA compliant; adjustable font sizes
- **Compatibility**: iOS 26+; Chrome, Firefox, Safari
- **Availability**: 99.5% uptime with automated failover
- **Data Privacy**: Compliant with South Africa's POPIA
- **Maintainability**: 70%+ unit test coverage; documented standards

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- Xcode 26+ (for iOS development)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/miet-africa-education-platform.git
cd miet-africa-education-platform

