
const isValidEmail = (email) => {
    const re =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(String(email).toLowerCase());
};


const isStrongPassword = (password) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(String(password));
};


module.exports = {
    isValidEmail,
    isStrongPassword
};
