import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PlaceHub database seed...');

  // 1. Create Demo College
  const college = await prisma.college.upsert({
    where: { code: 'AIT' },
    update: {},
    create: {
      name: 'Apex Institute of Technology',
      code: 'AIT',
      address: '100 Campus Road, Tech Valley, CA 94016',
      website: 'https://ait.edu',
      placementPolicy: JSON.stringify({
        maxOffersPerStudent: 2,
        allowMultipleOffers: true,
        debarOnRejection: false,
        dreamCompanyCtcThreshold: 15.0,
      }),
      settings: {
        create: {
          maxOffersPerStudent: 2,
          allowMultipleOffers: true,
          requireEmailVerification: false,
          placementYear: 2025,
        },
      },
    },
  });

  console.log('✓ Seeded college:', college.name);

  // 2. Passwords
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const studentPassword = await bcrypt.hash('Student@123', 12);
  const recruiterPassword = await bcrypt.hash('Recruiter@123', 12);

  // 3. Placement Officer (Admin)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@placehub.dev' },
    update: {},
    create: {
      email: 'admin@placehub.dev',
      password: adminPassword,
      role: 'PLACEMENT_OFFICER',
      collegeId: college.id,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✓ Seeded placement officer:', admin.email);

  // 4. Companies
  const companiesData = [
    {
      name: 'TechCorp Solutions',
      industry: 'Software & Cloud Services',
      website: 'https://techcorp.example.com',
      description: 'Global leader in enterprise cloud infrastructure and developer productivity tools.',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
    },
    {
      name: 'FinTech Dynamics',
      industry: 'Financial Technology & Algorithmic Trading',
      website: 'https://fintechdynamics.example.com',
      description: 'Next-generation algorithmic trading platforms and quantitative analytics systems.',
      logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&q=80',
    },
    {
      name: 'CloudScale Inc',
      industry: 'Cloud Infrastructure & DevOps',
      website: 'https://cloudscale.example.com',
      description: 'High-availability container platforms and distributed systems orchestration.',
      logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=128&q=80',
    },
    {
      name: 'NextGen Robotics',
      industry: 'Hardware, Embedded Systems & Robotics',
      website: 'https://nextgenrobotics.example.com',
      description: 'Pioneering autonomous industrial robotics and real-time vision processing units.',
      logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=128&q=80',
    },
  ];

  const companies: Record<string, any> = {};
  for (const c of companiesData) {
    companies[c.name] = await prisma.company.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }
  console.log('✓ Seeded companies:', Object.keys(companies).length);

  // 5. Recruiters
  const recruiter1User = await prisma.user.upsert({
    where: { email: 'recruiter@techcorp.com' },
    update: {},
    create: {
      email: 'recruiter@techcorp.com',
      password: recruiterPassword,
      role: 'RECRUITER',
      collegeId: college.id,
      isEmailVerified: true,
      isActive: true,
      recruiterProfile: {
        create: {
          name: 'Sarah Jenkins',
          designation: 'Lead University Talent Acquisition Partner',
          phone: '+1-555-019-2834',
          companyId: companies['TechCorp Solutions'].id,
        },
      },
    },
  });

  const recruiter2User = await prisma.user.upsert({
    where: { email: 'recruiter@fintech.io' },
    update: {},
    create: {
      email: 'recruiter@fintech.io',
      password: recruiterPassword,
      role: 'RECRUITER',
      collegeId: college.id,
      isEmailVerified: true,
      isActive: true,
      recruiterProfile: {
        create: {
          name: 'Marcus Vance',
          designation: 'Head of Quantitative Campus Recruitment',
          phone: '+1-555-018-9921',
          companyId: companies['FinTech Dynamics'].id,
        },
      },
    },
  });
  console.log('✓ Seeded recruiters:', recruiter1User.email, recruiter2User.email);

  // 6. Skills
  const skillsList = [
    { name: 'TypeScript', category: 'Language' },
    { name: 'JavaScript', category: 'Language' },
    { name: 'Python', category: 'Language' },
    { name: 'Java', category: 'Language' },
    { name: 'C++', category: 'Language' },
    { name: 'React', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Data Structures & Algorithms', category: 'Computer Science' },
    { name: 'System Design', category: 'Computer Science' },
  ];

  const skillsMap: Record<string, string> = {};
  for (const s of skillsList) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    skillsMap[s.name] = skill.id;
  }
  console.log('✓ Seeded skills:', Object.keys(skillsMap).length);

  // 7. Students
  // Student 1: High CGPA, CSE, fully eligible for all drives
  const student1User = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      email: 'student1@example.com',
      password: studentPassword,
      role: 'STUDENT',
      collegeId: college.id,
      isEmailVerified: true,
      isActive: true,
      studentProfile: {
        create: {
          firstName: 'Aarav',
          lastName: 'Sharma',
          phone: '+91-9876543210',
          rollNumber: 'CS21B001',
          graduationYear: 2025,
          branch: 'CSE',
          degree: 'B.Tech in Computer Science and Engineering',
          cgpa: 8.92,
          class10Percent: 94.5,
          class12Percent: 92.0,
          activeBacklogs: 0,
          backlogHistory: 0,
          linkedinUrl: 'https://linkedin.com/in/aarav-sharma-demo',
          githubUrl: 'https://github.com/aaravsharma-demo',
          portfolioUrl: 'https://aaravsharma.dev',
          bio: 'Passionate full-stack developer with experience building scalable distributed microservices and reactive interfaces.',
          profileComplete: 95,
        },
      },
    },
    include: { studentProfile: true },
  });

  const s1ProfileId = student1User.studentProfile!.id;

  // Add skills for Student 1
  for (const skillName of ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Data Structures & Algorithms']) {
    await prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId: s1ProfileId, skillId: skillsMap[skillName] } },
      update: {},
      create: {
        studentId: s1ProfileId,
        skillId: skillsMap[skillName],
        proficiency: 'ADVANCED',
      },
    });
  }

  // Add Projects for Student 1
  await prisma.project.createMany({
    data: [
      {
        studentId: s1ProfileId,
        title: 'Distributed Task Queue System',
        description: 'Built a reliable async task execution broker in Node.js and Redis featuring exponential backoff, priority queues, and real-time dashboard.',
        technologies: 'Node.js, TypeScript, Redis, React, Docker',
        githubUrl: 'https://github.com/aaravsharma-demo/task-broker',
        liveUrl: 'https://task-broker.demo.dev',
      },
      {
        studentId: s1ProfileId,
        title: 'Algorithmic Portfolio Optimizer',
        description: 'Interactive portfolio risk analyzer utilizing modern portfolio theory (Markowitz model) with real-time stock ticker integration.',
        technologies: 'Python, React, FastAPI, Tailwind CSS',
        githubUrl: 'https://github.com/aaravsharma-demo/quant-portfolio',
      },
    ],
  });

  // Add Experience for Student 1
  await prisma.experience.create({
    data: {
      studentId: s1ProfileId,
      company: 'Innovate Labs',
      role: 'Software Engineering Intern',
      description: 'Architected and deployed microservices handling 50k+ daily events. Reduced database read latency by 35% through Redis caching layers.',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-07-31'),
      isCurrent: false,
    },
  });

  // Add Resume for Student 1
  const resume1 = await prisma.resume.create({
    data: {
      studentId: s1ProfileId,
      filename: 'aarav_sharma_software_engineer_resume.pdf',
      originalName: 'Aarav_Sharma_Resume.pdf',
      fileUrl: '/uploads/resumes/demo_aarav_sharma.pdf',
      fileSize: 142850,
      isDefault: true,
      version: 1,
    },
  });

  // Student 2: ECE, Moderate CGPA (7.4), 1 backlog, eligible for selective drives
  const student2User = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      email: 'student2@example.com',
      password: studentPassword,
      role: 'STUDENT',
      collegeId: college.id,
      isEmailVerified: true,
      isActive: true,
      studentProfile: {
        create: {
          firstName: 'Priya',
          lastName: 'Patel',
          phone: '+91-9876543211',
          rollNumber: 'EC21B045',
          graduationYear: 2025,
          branch: 'ECE',
          degree: 'B.Tech in Electronics & Communication',
          cgpa: 7.40,
          class10Percent: 86.0,
          class12Percent: 82.5,
          activeBacklogs: 1,
          backlogHistory: 1,
          linkedinUrl: 'https://linkedin.com/in/priya-patel-demo',
          githubUrl: 'https://github.com/priyapatel-demo',
          bio: 'Electronics engineer enthusiastic about IoT, firmware development, and embedded computing systems.',
          profileComplete: 85,
        },
      },
    },
    include: { studentProfile: true },
  });

  const s2ProfileId = student2User.studentProfile!.id;

  for (const skillName of ['C++', 'Python', 'Docker', 'AWS']) {
    await prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId: s2ProfileId, skillId: skillsMap[skillName] } },
      update: {},
      create: {
        studentId: s2ProfileId,
        skillId: skillsMap[skillName],
        proficiency: 'INTERMEDIATE',
      },
    });
  }

  const resume2 = await prisma.resume.create({
    data: {
      studentId: s2ProfileId,
      filename: 'priya_patel_embedded_resume.pdf',
      originalName: 'Priya_Patel_Resume.pdf',
      fileUrl: '/uploads/resumes/demo_priya_patel.pdf',
      fileSize: 125600,
      isDefault: true,
      version: 1,
    },
  });

  console.log('✓ Seeded students:', student1User.email, student2User.email);

  // 8. Placement Drives
  const now = new Date();
  const pastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const futureMonth = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
  const futureTwoMonths = new Date(Date.now() + 50 * 24 * 60 * 60 * 1000);

  // Drive 1: TechCorp SDE
  const techCorpDrive = await prisma.placementDrive.create({
    data: {
      collegeId: college.id,
      companyId: companies['TechCorp Solutions'].id,
      title: 'Software Development Engineer - I',
      description: 'We are seeking talented early-career software engineers to join our core distributed platform engineering team. You will design, develop, and operate high-scale microservices processing billions of requests daily.',
      jobType: 'FULL_TIME',
      ctc: 18.5,
      stipend: 0,
      packageBreakdown: 'Base: 14.5 LPA | Performance Bonus: 2.0 LPA | Stock Units: 2.0 LPA (vested over 2 yrs)',
      location: 'Bangalore, India (Hybrid)',
      workMode: 'HYBRID',
      vacancies: 15,
      applicationOpenDate: pastWeek,
      applicationCloseDate: futureMonth,
      status: 'PUBLISHED',
      createdBy: admin.id,
      eligibilityCriteria: {
        create: {
          minCgpa: 7.5,
          minClass10: 75.0,
          minClass12: 75.0,
          maxActiveBacklogs: 0,
          allowBacklogHistory: false,
          graduationYears: '2025',
        },
      },
      eligibleBranches: {
        create: [
          { branch: 'CSE' },
          { branch: 'IT' },
          { branch: 'ECE' },
        ],
      },
      skillRequirements: {
        create: [
          { skillId: skillsMap['Data Structures & Algorithms'], isRequired: true },
          { skillId: skillsMap['TypeScript'], isRequired: true },
          { skillId: skillsMap['React'], isRequired: false },
        ],
      },
      stages: {
        create: [
          { name: 'Online Assessment (DSA & CS Fundamentals)', order: 1, description: '90-minute online coding round on HackerRank' },
          { name: 'Technical Interview 1', order: 2, description: 'Data structures, problem-solving, and complexity analysis' },
          { name: 'Technical Interview 2', order: 3, description: 'System design, database architecture, and project deep-dive' },
          { name: 'HR / Behavioral Round', order: 4, description: 'Culture fit, communication, and offer discussion' },
        ],
      },
    },
    include: { stages: true },
  });

  // Drive 2: FinTech Dynamics Quant Analyst
  const fintechDrive = await prisma.placementDrive.create({
    data: {
      collegeId: college.id,
      companyId: companies['FinTech Dynamics'].id,
      title: 'Quantitative Trading Analyst',
      description: 'Join our high-frequency algorithmic quantitative trading desk. Work directly alongside portfolio managers and mathematical modelers to implement real-time automated execution strategies.',
      jobType: 'FULL_TIME',
      ctc: 24.0,
      stipend: 0,
      packageBreakdown: 'Base: 18.0 LPA | Guaranteed Sign-on: 3.0 LPA | Performance Incentive: 3.0 LPA',
      location: 'Mumbai, India (On-site)',
      workMode: 'ON_SITE',
      vacancies: 6,
      applicationOpenDate: pastWeek,
      applicationCloseDate: futureMonth,
      status: 'PUBLISHED',
      createdBy: admin.id,
      eligibilityCriteria: {
        create: {
          minCgpa: 8.5,
          minClass10: 85.0,
          minClass12: 85.0,
          maxActiveBacklogs: 0,
          allowBacklogHistory: false,
          graduationYears: '2025',
        },
      },
      eligibleBranches: {
        create: [
          { branch: 'CSE' },
          { branch: 'ECE' },
        ],
      },
      skillRequirements: {
        create: [
          { skillId: skillsMap['Python'], isRequired: true },
          { skillId: skillsMap['Data Structures & Algorithms'], isRequired: true },
        ],
      },
      stages: {
        create: [
          { name: 'Quantitative Math & Aptitude Test', order: 1 },
          { name: 'Coding & Probability Round', order: 2 },
          { name: 'Partner Final Interview', order: 3 },
        ],
      },
    },
    include: { stages: true },
  });

  // Drive 3: CloudScale Cloud Operations Intern
  const cloudScaleDrive = await prisma.placementDrive.create({
    data: {
      collegeId: college.id,
      companyId: companies['CloudScale Inc'].id,
      title: 'Cloud DevOps & Platform Intern',
      description: '6-month internship with pre-placement offer (PPO) opportunity upon successful performance evaluation. Work on modern multi-cloud AWS and Kubernetes automation pipelines.',
      jobType: 'INTERNSHIP_TO_FULL_TIME',
      ctc: 12.0,
      stipend: 45000,
      packageBreakdown: 'Stipend: 45,000 INR/month for 6 months. Post conversion CTC: 12.0 LPA',
      location: 'Remote',
      workMode: 'REMOTE',
      vacancies: 10,
      applicationOpenDate: pastWeek,
      applicationCloseDate: futureTwoMonths,
      status: 'PUBLISHED',
      createdBy: admin.id,
      eligibilityCriteria: {
        create: {
          minCgpa: 7.0,
          minClass10: 60.0,
          minClass12: 60.0,
          maxActiveBacklogs: 1, // Student 2 with 1 backlog is eligible here!
          allowBacklogHistory: true,
          graduationYears: '2025',
        },
      },
      eligibleBranches: {
        create: [
          { branch: 'CSE' },
          { branch: 'IT' },
          { branch: 'ECE' },
          { branch: 'EE' },
          { branch: 'ME' },
        ],
      },
      skillRequirements: {
        create: [
          { skillId: skillsMap['Docker'], isRequired: true },
          { skillId: skillsMap['AWS'], isRequired: false },
        ],
      },
      stages: {
        create: [
          { name: 'Aptitude & Linux Concepts', order: 1 },
          { name: 'Technical Practical Task', order: 2 },
          { name: 'Manager Round', order: 3 },
        ],
      },
    },
    include: { stages: true },
  });

  // Drive 4: NextGen Robotics (Draft Drive)
  await prisma.placementDrive.create({
    data: {
      collegeId: college.id,
      companyId: companies['NextGen Robotics'].id,
      title: 'Embedded Firmware Specialist',
      description: 'Develop low-level C++ drivers for robotic actuators and sensors.',
      jobType: 'FULL_TIME',
      ctc: 14.0,
      location: 'Pune, India',
      workMode: 'ON_SITE',
      applicationOpenDate: now,
      applicationCloseDate: futureMonth,
      status: 'DRAFT',
      createdBy: admin.id,
      eligibilityCriteria: {
        create: {
          minCgpa: 7.0,
          maxActiveBacklogs: 0,
        },
      },
      eligibleBranches: {
        create: [{ branch: 'ECE' }, { branch: 'EE' }],
      },
    },
  });

  console.log('✓ Seeded placement drives');

  // 9. Applications
  // Student 1 -> TechCorp (Status: TECHNICAL_INTERVIEW)
  const app1 = await prisma.application.create({
    data: {
      studentId: s1ProfileId,
      driveId: techCorpDrive.id,
      resumeId: resume1.id,
      status: 'TECHNICAL_INTERVIEW',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      statusHistory: {
        create: [
          { status: 'APPLIED', note: 'Application submitted successfully', changedBy: student1User.id, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { status: 'SHORTLISTED', note: 'Profile cleared initial screening', changedBy: recruiter1User.id, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { status: 'ASSESSMENT', note: 'Cleared Online Assessment with 98% score', changedBy: admin.id, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'TECHNICAL_INTERVIEW', note: 'Scheduled for Round 1 Technical Interview', changedBy: recruiter1User.id, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ],
      },
      interviews: {
        create: [
          {
            stageId: techCorpDrive.stages[1]?.id,
            scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            mode: 'ONLINE',
            meetingLink: 'https://meet.google.com/abc-defg-hij',
            location: 'Google Meet',
            feedback: 'Candidate displayed exceptional algorithmic fluency in previous rounds.',
          },
        ],
      },
    },
  });

  // Student 1 -> FinTech Dynamics (Status: SHORTLISTED)
  await prisma.application.create({
    data: {
      studentId: s1ProfileId,
      driveId: fintechDrive.id,
      resumeId: resume1.id,
      status: 'SHORTLISTED',
      appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      statusHistory: {
        create: [
          { status: 'APPLIED', note: 'Applied online', changedBy: student1User.id },
          { status: 'SHORTLISTED', note: 'Shortlisted based on CGPA and quantitative background', changedBy: recruiter2User.id },
        ],
      },
    },
  });

  // Student 2 -> CloudScale (Status: UNDER_REVIEW)
  await prisma.application.create({
    data: {
      studentId: s2ProfileId,
      driveId: cloudScaleDrive.id,
      resumeId: resume2.id,
      status: 'UNDER_REVIEW',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      statusHistory: {
        create: [
          { status: 'APPLIED', note: 'Applied online', changedBy: student2User.id },
          { status: 'UNDER_REVIEW', note: 'Under initial review by campus recruiter', changedBy: admin.id },
        ],
      },
    },
  });

  console.log('✓ Seeded candidate applications with status histories and interview schedule');

  // 10. Announcements
  await prisma.announcement.createMany({
    data: [
      {
        collegeId: college.id,
        title: 'TechCorp Solutions Campus Drive — Interview Guidelines',
        content: 'Shortlisted students for TechCorp Solutions SDE-I are requested to join the prep webinar on Tuesday at 5 PM. Keep your webcam enabled and test your microphone beforehand.',
        createdBy: admin.id,
        targetRoles: 'STUDENT',
      },
      {
        collegeId: college.id,
        title: 'Placement Season 2024-2025 Rules and Policy Reminder',
        content: 'Please ensure your resume versions are updated. Students with more than 2 offers will have their additional applications automatically held in accordance with the campus placement policy.',
        createdBy: admin.id,
        targetRoles: 'ALL',
      },
    ],
  });

  // 11. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1User.id,
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview Scheduled: TechCorp Solutions',
        message: 'Your Technical Interview Round 1 has been scheduled for tomorrow at 2:00 PM via Google Meet.',
        isRead: false,
      },
      {
        userId: student1User.id,
        type: 'SHORTLISTED',
        title: 'Shortlisted for FinTech Dynamics',
        message: 'Congratulations! Your profile has been shortlisted for Quantitative Trading Analyst at FinTech Dynamics.',
        isRead: false,
      },
      {
        userId: student2User.id,
        type: 'APPLICATION_CONFIRMED',
        title: 'Application Received: CloudScale Inc',
        message: 'Your application for Cloud DevOps & Platform Intern has been received and is under review.',
        isRead: true,
      },
    ],
  });

  console.log('✓ Seeded announcements and notifications');
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
