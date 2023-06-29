const crypto = require('crypto')
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Un utilisateur doit avoir un nom']
        },
        email: {
            type: String, 
            required: [true, 'Un utilisateur doit avoir un mail'],
            unique: true,
            lowercase: true, 
            validate: [validator.isEmail, 'Veuillez mettre un mail valide']
        },
        photo: String,
        role: {
            type: String,
            enum: ['user', 'member', 'admin'],
            default: 'user'
        },
        password: {
            type: String, 
            required: [true, 'Un mot de passe est obligatoire'],
            minlength: 8
        },
        passwordConfirm: {
            type: String, 
            required: [true, 'Mot de passe non conforme'],
            validate: {
                validator: function(el) {
                    return el === this.password
                },
                message: 'Les mots de passe ne correspondent pas'
            }
        }, 
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false
        }
    })

    userSchema.pre('save', async function(next) {
        
        if(!this.isModified('password')) return next();

        this.password = await bcrypt.hash(this.password, 12)

        this.passwordConfirm = undefined;

        next()
    })

    userSchema.pre('save', function(next) {
        if (!this.isModified('password') || this.isNew) return next();
      
        this.passwordChangedAt = Date.now() - 1000;
        next();
      });
      
      userSchema.pre(/^find/, function(next) {
        // this points to the current query
        this.find({ active: { $ne: false } });
        next();
      });

    userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
        return await bcrypt.compare(candidatePassword, userPassword)
    }

    userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
        if (this.passwordChangedAt) {
          const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
          );
      
          return JWTTimestamp < changedTimestamp;
        }
      
        // False means NOT changed
        return false;
      };

      userSchema.methods.createPasswordResetToken = function() {
        const resetToken = crypto.randomBytes(32).toString('hex');
    
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        console.log({resetToken}, this.passwordResetToken)
    
        this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
        return resetToken;
    }
    

    const User = mongoose.model('User', userSchema);

    module.exports = User;