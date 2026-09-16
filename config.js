/* Couchette waitlist — form backend config
 * FormSubmit.co: first real submit emails an activation link to the inbox.
 * After activation, submissions land as emails (exportable / forward to Sheets).
 * Override FORM_ENDPOINT if you switch to Formspree / Formspark / Tally.
 */
window.COUCHETTE_CONFIG = {
  /* FormSubmit AJAX endpoint (email discovered via connected Gmail) */
  FORM_ENDPOINT: "https://formsubmit.co/ajax/thibaut3mallet@gmail.com",
  FORM_SUBJECT: "Couchette — nouvelle inscription waitlist",
  /* Optional: set after FormSubmit activation to hide the raw email in the URL */
  /* FORM_ENDPOINT: "https://formsubmit.co/ajax/<hash-from-dashboard>", */
};
