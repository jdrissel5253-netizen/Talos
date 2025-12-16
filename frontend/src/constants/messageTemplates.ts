export interface MessageTemplate {
  id: string;
  category: 'contact' | 'rejection';
  communicationType: 'email' | 'sms';
  type?: 'video' | 'phone' | 'in-person';
  tone: 'conversational' | 'friendly' | 'professional';
  isNudge: boolean;
  subject?: string;
  body: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  // ==================== CONVERSATIONAL TONE ====================

  // Video Interview - Conversational
  {
    id: 'contact-video-conversational-initial',
    category: 'contact',
    communicationType: 'email',
    type: 'video',
    tone: 'conversational',
    isNudge: false,
    subject: 'Quick video chat about the "Position"',
    body: `Hi __,
Thanks for applying to the "Position" position. I checked out your resume and I'd love to hop on a quick video chat to learn more about you and the role.
Pick a time that works for you here: [link]
Talk soon!`
  },

  // Phone Screen - Conversational
  {
    id: 'contact-phone-conversational-initial',
    category: 'contact',
    communicationType: 'email',
    type: 'phone',
    tone: 'conversational',
    isNudge: false,
    subject: 'Quick phone call about the "Position"',
    body: `Hi __,
Appreciate you applying to the "Position" position. After looking over your resume, I'd like to set up a quick phone call so we can chat more about the role and your background.
Grab a time here: [link]
Looking forward to it!`
  },

  // In-Person - Conversational
  {
    id: 'contact-in-person-conversational-initial',
    category: 'contact',
    communicationType: 'email',
    type: 'in-person',
    tone: 'conversational',
    isNudge: false,
    subject: 'Let\'s meet about the "Position"',
    body: `Hi __,
Thanks for applying to the "Position" position. Your background looks great, and I'd love for us to meet in person and chat more about the opportunity.
Choose a time here: [link]
Excited to meet you!`
  },

  // ==================== FRIENDLY TONE ====================

  // Video Interview - Friendly
  {
    id: 'contact-video-friendly-initial',
    category: 'contact',
    communicationType: 'email',
    type: 'video',
    tone: 'friendly',
    isNudge: false,
    subject: 'Video interview for the "Position"',
    body: `Hi __,
Thanks for applying to the "Position" position. After reviewing your resume, I'd love to set up a short video interview to learn more about your experience and interest in the role.
Please select a time that works best for you here: [link]
Looking forward to speaking with you!`
  },

  // Phone Screen - Friendly
  {
    id: 'contact-phone-friendly-initial',
    category: 'contact',
    communicationType: 'email',
    type: 'phone',
    tone: 'friendly',
    isNudge: false,
    subject: 'Phone call about the "Position"',
    body: `Hi __,
Thank you for applying to the "Position" position. After looking through your resume, I'd love to schedule a quick phone call to talk more about the role and your background.
Feel free to pick a time here: [link]
Talk soon!`
  },

  // In-Person - Friendly
  {
    id: 'contact-in-person-friendly-initial',
    category: 'contact',
    communicationType: 'email',
    type: 'in-person',
    tone: 'friendly',
    isNudge: false,
    subject: 'In-person interview for the "Position"',
    body: `Hi __,
Thanks for applying to the "Position" position. Your experience stood out, and I'd love to bring you in for an in-person interview to discuss the role in more detail.
You can choose a time here: [link]
Looking forward to meeting you!`
  },

  // ==================== PROFESSIONAL TONE ====================

  // Video Interview - Professional
  {
    id: 'contact-video-professional-initial',
    category: 'contact',
    communicationType: 'email',
    type: 'video',
    tone: 'professional',
    isNudge: false,
    subject: 'Video interview invitation - "Position"',
    body: `Hello __,
Thank you for your application for the "Position" position. After reviewing your qualifications, I would like to schedule a brief video interview to discuss your background and alignment with the role.
Please select a convenient time using this link: [link]
I look forward to speaking with you.`
  },

  // Phone Screen - Professional
  {
    id: 'contact-phone-professional-initial',
    category: 'contact',
    communicationType: 'email',
    type: 'phone',
    tone: 'professional',
    isNudge: false,
    subject: 'Phone interview - "Position"',
    body: `Hello __,
Thank you for applying to the "Position" position. Based on your resume, I would like to move forward with a phone call to discuss your experience further.
You may choose an available time here: [link]
Thank you, and I look forward to our conversation.`
  },

  // In-Person - Professional
  {
    id: 'contact-in-person-professional-initial',
    category: 'contact',
    communicationType: 'email',
    type: 'in-person',
    tone: 'professional',
    isNudge: false,
    subject: 'In-person interview invitation - "Position"',
    body: `Hello __,
Thank you for your interest in the "Position" position. After reviewing your resume, I would like to invite you to an in-person interview to explore your qualifications further.
Please select a suitable time here: [link]
I look forward to meeting you in person.`
  },

  // ==================== FOLLOW-UP NUDGES - CONVERSATIONAL ====================

  {
    id: 'contact-video-conversational-nudge',
    category: 'contact',
    communicationType: 'email',
    type: 'video',
    tone: 'conversational',
    isNudge: true,
    subject: 'Following up - video chat about "Position"',
    body: `Hi __,
Just checking in! I wanted to see if you had a chance to pick a time for our video chat about the "Position" position.
Here's the link again: [link]
Looking forward to talking with you!`
  },

  {
    id: 'contact-phone-conversational-nudge',
    category: 'contact',
    communicationType: 'email',
    type: 'phone',
    tone: 'conversational',
    isNudge: true,
    subject: 'Following up - phone call about "Position"',
    body: `Hi __,
I wanted to follow up to see if you had a chance to schedule your phone interview about the "Position" position.
Grab a time here: [link]
Hope to connect soon!`
  },

  {
    id: 'contact-in-person-conversational-nudge',
    category: 'contact',
    communicationType: 'email',
    type: 'in-person',
    tone: 'conversational',
    isNudge: true,
    subject: 'Following up - in-person interview for "Position"',
    body: `Hi __,
Just following up to see if you had a chance to pick a time for the in-person interview for the "Position" position.
Here's the link again: [link]
Excited to meet you!`
  },

  // ==================== FOLLOW-UP NUDGES - FRIENDLY ====================

  {
    id: 'contact-video-friendly-nudge',
    category: 'contact',
    communicationType: 'email',
    type: 'video',
    tone: 'friendly',
    isNudge: true,
    subject: 'Following up on your video interview - "Position"',
    body: `Hi __,
I wanted to follow up regarding your video interview for the "Position" position. If you haven't scheduled yet, you can select a time that works best here: [link]
Looking forward to our conversation!`
  },

  {
    id: 'contact-phone-friendly-nudge',
    category: 'contact',
    communicationType: 'email',
    type: 'phone',
    tone: 'friendly',
    isNudge: true,
    subject: 'Following up on your phone interview - "Position"',
    body: `Hi __,
Just checking in about scheduling your phone interview for the "Position" position.
Please pick a time here: [link]
Can't wait to chat with you!`
  },

  {
    id: 'contact-in-person-friendly-nudge',
    category: 'contact',
    communicationType: 'email',
    type: 'in-person',
    tone: 'friendly',
    isNudge: true,
    subject: 'Following up on your in-person interview - "Position"',
    body: `Hi __,
I just wanted to follow up to see if you've scheduled your in-person interview for the "Position" position.
Here's the link again: [link]
Looking forward to meeting you!`
  },

  // ==================== FOLLOW-UP NUDGES - PROFESSIONAL ====================

  {
    id: 'contact-video-professional-nudge',
    category: 'contact',
    communicationType: 'email',
    type: 'video',
    tone: 'professional',
    isNudge: true,
    subject: 'Follow-up: Video interview - "Position"',
    body: `Hello __,
I wanted to follow up regarding your video interview for the "Position" position. If you have not yet scheduled a time, please select a convenient slot using this link: [link]
I look forward to speaking with you.`
  },

  {
    id: 'contact-phone-professional-nudge',
    category: 'contact',
    communicationType: 'email',
    type: 'phone',
    tone: 'professional',
    isNudge: true,
    subject: 'Follow-up: Phone interview - "Position"',
    body: `Hello __,
This is a follow-up regarding your potential phone interview for the "Position" position. If you have not yet scheduled, please choose a suitable time here: [link]
Thank you, and I look forward to our conversation.`
  },

  {
    id: 'contact-in-person-professional-nudge',
    category: 'contact',
    communicationType: 'email',
    type: 'in-person',
    tone: 'professional',
    isNudge: true,
    subject: 'Follow-up: In-person interview - "Position"',
    body: `Hello __,
I am following up regarding your in-person interview for the "Position" position. If you have not yet scheduled a time, please select a convenient slot using this link: [link]
I look forward to meeting you in person.`
  },

  // ==================== REJECTION MESSAGES ====================

  {
    id: 'rejection-conversational',
    category: 'rejection',
    communicationType: 'email',
    tone: 'conversational',
    isNudge: false,
    subject: 'Update on your application for "Position"',
    body: `Hi __,
Thanks so much for taking the time to interview for the "Position" position. While we really enjoyed speaking with you, we've decided to move forward with another candidate.
We appreciate your interest and wish you the best in your job search!`
  },

  {
    id: 'rejection-friendly',
    category: 'rejection',
    communicationType: 'email',
    tone: 'friendly',
    isNudge: false,
    subject: 'Update regarding "Position"',
    body: `Hi __,
Thank you for interviewing for the "Position" position. After careful consideration, we've decided to move forward with another candidate.
We truly appreciate the time and effort you put into the process, and we wish you every success in your job search.`
  },

  {
    id: 'rejection-professional',
    category: 'rejection',
    communicationType: 'email',
    tone: 'professional',
    isNudge: false,
    subject: 'Application status update - "Position"',
    body: `Hello __,
Thank you for taking the time to interview for the "Position" position. After a thorough review, we have chosen to move forward with another candidate.
We sincerely appreciate your interest in the role and wish you the best in your future endeavors.`
  },

  // ==================== SMS TEMPLATES - CONVERSATIONAL ====================

  {
    id: 'contact-video-conversational-initial-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'video',
    tone: 'conversational',
    isNudge: false,
    body: `Hi __! Thanks for applying to the "Position" position. I'd love to hop on a quick video chat. Pick a time here: [link]`
  },

  {
    id: 'contact-phone-conversational-initial-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'phone',
    tone: 'conversational',
    isNudge: false,
    body: `Hi __! Thanks for applying to the "Position" position. I'd like to set up a quick phone call. Grab a time here: [link]`
  },

  {
    id: 'contact-in-person-conversational-initial-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'in-person',
    tone: 'conversational',
    isNudge: false,
    body: `Hi __! Your background looks great for the "Position" position. I'd love to meet in person. Choose a time here: [link]`
  },

  // ==================== SMS TEMPLATES - FRIENDLY ====================

  {
    id: 'contact-video-friendly-initial-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'video',
    tone: 'friendly',
    isNudge: false,
    body: `Hi __, thanks for applying to the "Position" position. I'd love to set up a video interview. Please pick a time: [link]`
  },

  {
    id: 'contact-phone-friendly-initial-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'phone',
    tone: 'friendly',
    isNudge: false,
    body: `Hi __, thank you for applying to the "Position" position. I'd like to schedule a phone call. Pick a time here: [link]`
  },

  {
    id: 'contact-in-person-friendly-initial-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'in-person',
    tone: 'friendly',
    isNudge: false,
    body: `Hi __, your experience stood out for the "Position" position. I'd love to meet in person. Choose a time: [link]`
  },

  // ==================== SMS TEMPLATES - PROFESSIONAL ====================

  {
    id: 'contact-video-professional-initial-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'video',
    tone: 'professional',
    isNudge: false,
    body: `Hello __, thank you for applying to the "Position" position. I would like to schedule a video interview. Please select a time: [link]`
  },

  {
    id: 'contact-phone-professional-initial-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'phone',
    tone: 'professional',
    isNudge: false,
    body: `Hello __, thank you for applying to the "Position" position. I would like to schedule a phone call. Please choose a time: [link]`
  },

  {
    id: 'contact-in-person-professional-initial-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'in-person',
    tone: 'professional',
    isNudge: false,
    body: `Hello __, thank you for your interest in the "Position" position. I would like to invite you to an in-person interview. Please select a time: [link]`
  },

  // ==================== SMS NUDGES - CONVERSATIONAL ====================

  {
    id: 'contact-video-conversational-nudge-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'video',
    tone: 'conversational',
    isNudge: true,
    body: `Hi __! Just checking in - did you get a chance to schedule our video chat for the "Position" position? Here's the link: [link]`
  },

  {
    id: 'contact-phone-conversational-nudge-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'phone',
    tone: 'conversational',
    isNudge: true,
    body: `Hi __! Following up about scheduling your phone interview for the "Position" position. Grab a time here: [link]`
  },

  {
    id: 'contact-in-person-conversational-nudge-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'in-person',
    tone: 'conversational',
    isNudge: true,
    body: `Hi __! Just following up - did you get a chance to schedule our in-person meeting for the "Position" position? Here's the link: [link]`
  },

  // ==================== SMS NUDGES - FRIENDLY ====================

  {
    id: 'contact-video-friendly-nudge-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'video',
    tone: 'friendly',
    isNudge: true,
    body: `Hi __, following up on your video interview for the "Position" position. Please schedule a time when convenient: [link]`
  },

  {
    id: 'contact-phone-friendly-nudge-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'phone',
    tone: 'friendly',
    isNudge: true,
    body: `Hi __, just checking in about scheduling your phone interview for the "Position" position. Please pick a time: [link]`
  },

  {
    id: 'contact-in-person-friendly-nudge-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'in-person',
    tone: 'friendly',
    isNudge: true,
    body: `Hi __, following up about your in-person interview for the "Position" position. Please select a time: [link]`
  },

  // ==================== SMS NUDGES - PROFESSIONAL ====================

  {
    id: 'contact-video-professional-nudge-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'video',
    tone: 'professional',
    isNudge: true,
    body: `Hello __, this is a follow-up regarding your video interview for the "Position" position. Please select a time: [link]`
  },

  {
    id: 'contact-phone-professional-nudge-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'phone',
    tone: 'professional',
    isNudge: true,
    body: `Hello __, following up regarding your phone interview for the "Position" position. Please choose a time: [link]`
  },

  {
    id: 'contact-in-person-professional-nudge-sms',
    category: 'contact',
    communicationType: 'sms',
    type: 'in-person',
    tone: 'professional',
    isNudge: true,
    body: `Hello __, following up regarding your in-person interview for the "Position" position. Please select a time: [link]`
  },

  // ==================== SMS REJECTION MESSAGES ====================

  {
    id: 'rejection-conversational-sms',
    category: 'rejection',
    communicationType: 'sms',
    tone: 'conversational',
    isNudge: false,
    body: `Hi __, thanks for interviewing for the "Position" position. We've decided to move forward with another candidate. We appreciate your interest and wish you the best!`
  },

  {
    id: 'rejection-friendly-sms',
    category: 'rejection',
    communicationType: 'sms',
    tone: 'friendly',
    isNudge: false,
    body: `Hi __, thank you for interviewing for the "Position" position. After careful consideration, we've decided to move forward with another candidate. We wish you every success!`
  },

  {
    id: 'rejection-professional-sms',
    category: 'rejection',
    communicationType: 'sms',
    tone: 'professional',
    isNudge: false,
    body: `Hello __, thank you for interviewing for the "Position" position. After thorough review, we have chosen to move forward with another candidate. We wish you the best.`
  }
];
