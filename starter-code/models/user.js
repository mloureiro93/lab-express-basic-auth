'use strict';

// User model goes here
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name:{
        type: String,
        default:''
    } ,

    username: {
      type: String,
      required: true,
      unique: true
    
    },
    
    passwordHash: {
      type: String,
      required: true

    }
  
  
  });

const User = mongoose.model('User', userSchema);

module.exports = User;