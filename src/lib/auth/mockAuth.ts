/* eslint-disable @typescript-eslint/no-explicit-any */
import emailjs from "emailjs-com";

const invitedEmails = [
  "admin@tweetgarot.com",
  "manager@tweetgarot.com",
  "supervisor@tweetgarot.com",
  "contractor@example.com",
  "max.vanasten@tweetgarot.com",
];

const inviteTokens: Record<string, { code: string; createdAt: number; used: boolean; companyName?: string }> = {
  "contractor@example.com": { code: "12345", createdAt: Date.now(), used: false },
  "test@contractor.com": { code: "DEMO1", createdAt: Date.now(), used: false },
};

export const mockAuth = {
  currentUser: null as any,
  invitedEmails,
  inviteTokens,
  submissions: [] as any[],

  generateInviteCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  },

  async sendInvitationEmail(email: string, code: string, companyName = "") {
    const service = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
    const template = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;
    const portalUrl = typeof window !== "undefined" ? window.location.href : "";

    try {
      await emailjs.send(service, template, {
        to_name: companyName || "Contractor",
        to_email: email,
        access_code: code,
        portal_url: portalUrl,
      }, publicKey);
      // Optional toast
      return true;
    } catch (e) {
      console.warn("EmailJS failed, simulate instead", e);
      if (typeof window !== "undefined") {
        alert(`📧 Email simulation -> ${email}\nAccess Code: ${code}\nURL: ${portalUrl}`);
      }
      return false;
    }
  },

  inviteContractor(email: string, companyName = "") {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email");
    if (this.inviteTokens[email] && !this.inviteTokens[email].used) throw new Error("Already invited and pending");

    const code = this.generateInviteCode();
    this.inviteTokens[email] = { code, createdAt: Date.now(), used: false, companyName };
    this.sendInvitationEmail(email, code, companyName);
    return { email, code };
  },

  async signInWithEmail(email: string, accessCode: string) {
    await new Promise((r) => setTimeout(r, 500));
    const low = email.toLowerCase();
    const isTG = low.endsWith("@tweetgarot.com");

    if (isTG && accessCode === "12345") {
      this.currentUser = { email, uid: String(Date.now()), isAdmin: true };
      return { user: this.currentUser };
    }
    const invite = this.inviteTokens[low];
    if (invite && invite.code === accessCode.toUpperCase()) {
      this.currentUser = { email, uid: String(Date.now()), isAdmin: false };
      return { user: this.currentUser };
    }
    if (this.invitedEmails.includes(low) && accessCode === "12345") {
      this.currentUser = { email, uid: String(Date.now()), isAdmin: false };
      return { user: this.currentUser };
    }
    throw new Error("Invalid email or access code.");
  },

  async signOut() { this.currentUser = null; },

  saveSubmission(formData: any, results: any) {
    const sub = {
      id: String(Date.now()),
      submittedAt: new Date(),
      submittedBy: this.currentUser?.email || "unknown",
      companyName: formData.companyLegalName,
      formData, results, status: "pending_review",
    };
    this.submissions.push(sub);
    if (this.currentUser?.email && this.inviteTokens[this.currentUser.email]) {
      this.inviteTokens[this.currentUser.email].used = true;
    }
    return sub;
  },
};
