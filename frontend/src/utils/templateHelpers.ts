import { MESSAGE_TEMPLATES, MessageTemplate } from '../constants/messageTemplates';

/**
 * Get a template by its criteria
 */
export function getTemplate(
  category: 'contact' | 'rejection',
  tone: 'conversational' | 'friendly' | 'professional',
  isNudge: boolean,
  type?: 'video' | 'phone' | 'in-person',
  communicationType?: 'email' | 'sms'
): MessageTemplate | undefined {
  return MESSAGE_TEMPLATES.find(template =>
    template.category === category &&
    template.tone === tone &&
    template.isNudge === isNudge &&
    (category === 'rejection' || template.type === type) &&
    (!communicationType || template.communicationType === communicationType)
  );
}

/**
 * Render a template by replacing placeholders with actual values
 */
export function renderTemplate(
  template: MessageTemplate,
  candidateName: string,
  position: string,
  schedulingLink: string = '[link]'
): { subject?: string; body: string } {
  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/__/g, candidateName)
      .replace(/"Position"/g, position)
      .replace(/\[link\]/g, schedulingLink);
  };

  return {
    subject: template.subject ? replacePlaceholders(template.subject) : undefined,
    body: replacePlaceholders(template.body)
  };
}

/**
 * Extract candidate name from filename
 * Examples:
 * - "John_Doe_Resume.pdf" -> "John Doe"
 * - "jane-smith.pdf" -> "Jane Smith"
 * - "Resume_Bob_Johnson.pdf" -> "Bob Johnson"
 */
export function extractCandidateName(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(pdf|docx?|txt)$/i, '');

  // Remove common resume-related words
  const cleaned = nameWithoutExt
    .replace(/resume|cv|application/gi, '')
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes

  // Replace underscores and dashes with spaces
  const withSpaces = cleaned.replace(/[_-]/g, ' ');

  // Capitalize each word
  const capitalized = withSpaces
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // If we couldn't extract a name, return a fallback
  return capitalized.trim() || 'Candidate';
}

/**
 * Get available interview types for contact templates
 */
export function getInterviewTypes(): Array<{ value: 'video' | 'phone' | 'in-person'; label: string }> {
  return [
    { value: 'video', label: 'Video Interview' },
    { value: 'phone', label: 'Phone Screen' },
    { value: 'in-person', label: 'In-Person' }
  ];
}

/**
 * Get available tones for templates
 */
export function getTones(): Array<{ value: 'conversational' | 'friendly' | 'professional'; label: string }> {
  return [
    { value: 'conversational', label: 'Conversational' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'professional', label: 'Professional' }
  ];
}
