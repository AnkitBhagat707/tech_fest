const mongoose = require("mongoose");

const activitiesList = [
  "music", "dance", "coding", "bgmi", "free fire", "treasure hunt", "debate",
      "story writing", "poetry", "calligraphy", "stand up comedy", "poster making",
      "hand painting", "nail art", "theme based art gallery", "face painting",
      "cup snatching", "push up challenge", "riddles", "flip the bottle",
      "face arranging", "mind tricks", "naati", "vandana", "bhangra",
      "haryanvi dance", "south indian dance", "gidda", "bollywood", "modelling",
      "nepali dance", "skit", "group singing", "duet singing"
];


const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    match: [/^[A-Za-z\s]+$/, "Name should contain only letters"]
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"]
  },

  rollno: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Za-z0-9-]{4,20}$/, "Invalid roll number"]
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },

  activity: [{
    type: String,
    enum: activitiesList,  
    lowercase: true,        
    trim: true
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Student", studentSchema);