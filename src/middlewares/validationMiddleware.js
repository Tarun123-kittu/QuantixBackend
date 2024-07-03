const { check, validationResult,body } = require('express-validator');

const validateRegister = [
  check('username', 'Please provide username.').not().isEmpty(),
  check('email', 'Please provide email.').not().isEmpty(),
  check('email', 'Please enter a correct email format.').isEmail(),
  check('password', 'Please provide password.').not().isEmpty(),
  check('password')
  .isLength({ min: 7 }).withMessage('Password must be at least 7 characters long.')
  .matches(/[A-Z]/).withMessage('Password must include an uppercase letter.')
  .matches(/\d/).withMessage('Password must include a number.'),
  (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
  next();
  }
];


const validateSignIn = [
  check('usernameOrEmail', 'Please enter your login credentials (email or username).').not().isEmpty(),
  check('password', 'Please enter your password.').not().isEmpty(),
  (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });}
  next();
  }
];


const validateForgetPassword = [
  check('email', 'Please enter your registered email.').not().isEmpty(),
  check('email', 'Please enter a valid email address.').isEmail(),
  (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });}
  next();
  }
];


const validateVerifyOTP = [
  check('email', 'Email not present.').not().isEmpty(),
  check('otp', 'Please enter the otp.').not().isEmpty(),
  (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
  return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });}
  next();
  }
]



const validateResetPassword = [
  check('email', 'Email not present.').not().isEmpty(),
  check('password', 'Please enter your new password.').not().isEmpty(),
  check('password')
  .isLength({ min: 7 }).withMessage('Password must be at least 7 characters long.')
  .matches(/[A-Z]/).withMessage('Password must include an uppercase letter.')
  .matches(/\d/).withMessage('Password must include a number.'),
  check('confirmPassword', 'Please enter confirm password.').not().isEmpty(),
  check('confirmPassword').custom((value, { req }) => {
  if (value !== req.body.password) { throw new Error('Your confirm password is not matching with your password'); }
  return true;
  }),
  (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
  next();
  }
]


const validateSocialLogin = [
  check('providerName', 'Provider name not present.').not().isEmpty(),
  check('providerName', 'Provider name must be one of the following: google, twitter, or facebook.')
  .isIn(['google', 'twitter', 'facebook']),
  check('providerId', 'Provider ID not present.').not().isEmpty(),
  check('email', 'Email not present.').not().isEmpty(),
  check('email', 'Please enter a correct email format.').isEmail(),
  (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
  next();
  }
];


const validateAddPlans = [
  check('planName', 'Please provide plan name.').not().isEmpty(),
  check('planAddress', 'Please provide plan address.').not().isEmpty(),
  (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
  next();
  }
]


const validateDeletePlan = [
  check('planId', 'Please provide planId.').not().isEmpty(),
  (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
  next();
  }
]


const validateChangePassword = [
  check('password', 'Please enter password.').not().isEmpty(),
  check('newPassword', 'Please enter new password.').not().isEmpty(),
  check('confirmPassword', 'Please enter confirm password.').not().isEmpty(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Confirm password does not match new password.');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
    }
    next();
  }
];



module.exports = {
  validateRegister,
  validateSignIn,
  validateForgetPassword,
  validateVerifyOTP,
  validateResetPassword,
  validateSocialLogin,
  validateAddPlans,
  validateDeletePlan,
  validateChangePassword
};
