/**
 * Utility to simulate sending SMS notifications / Push Notifications to trusted contacts.
 * In a production app, this would integrate with services like Twilio or Firebase Cloud Messaging (FCM).
 */
const sendAlertsToContacts = async (user, location, audioSnippetUrl = null) => {
  console.log(`\n🔔 [SOS SIMULATOR] Initiating emergency broadcast for user: ${user.name} (${user.email})`);
  
  if (!user.contacts || user.contacts.length === 0) {
    console.log(`⚠️ [SOS SIMULATOR] No trusted contacts configured for ${user.name}. Unable to send SMS alerts!`);
    return;
  }

  // Simulate a network delay for the SMS/Notification service
  await new Promise((resolve) => setTimeout(resolve, 500));

  user.contacts.forEach((contact) => {
    console.log(`--------------------------------------------------`);
    console.log(`📲 Sending SMS alert to: ${contact.name}`);
    console.log(`📞 Phone Number: ${contact.phone}`);
    console.log(`👥 Relationship: ${contact.relationship}`);
    console.log(`📝 Message Content:`);
    console.log(`   "EMERGENCY ALERT: SafeWalk User ${user.name} is in danger!`);
    console.log(`   Last tracked coordinates: Lat: ${location.lat}, Lng: ${location.lng}`);
    console.log(`   Live tracking link: https://maps.google.com/?q=${location.lat},${location.lng}`);
    if (audioSnippetUrl) {
      console.log(`   Ambient audio recording: ${audioSnippetUrl}`);
    }
    console.log(`   Please check on them immediately!"`);
    console.log(`--------------------------------------------------`);
  });

  console.log(`✅ [SOS SIMULATOR] Broadcast complete. Alerts sent to ${user.contacts.length} contact(s).\n`);
};

module.exports = {
  sendAlertsToContacts
};
