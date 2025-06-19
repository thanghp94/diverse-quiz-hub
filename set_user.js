
console.log("Setting current user to GV0002");
localStorage.setItem("currentUser", JSON.stringify({
  id: "GV0002", 
  name: "Teacher",
  first_name: "Thang",
  last_name: "Huynh",
  email: "thanghuynh@meraki.edu.vn"
}));
console.log("Current user set to:", JSON.parse(localStorage.getItem("currentUser")));

// Verify the setting worked
const verifyUser = localStorage.getItem("currentUser");
if (verifyUser) {
  const parsed = JSON.parse(verifyUser);
  console.log("Verification - User ID:", parsed.id);
  console.log("Verification - Is GV0002:", parsed.id === "GV0002");
} else {
  console.error("Failed to set user in localStorage");
}
