# Reset-password-with-OTP
Create a new express app that would be used for authentication.
The app should have a login, register, forgot password and reset password route.
The register route is going to accept a username, phone number and password.
The login route will accept a username and password.
The forgot password will accept an email and send a 6 digit OTP and the ciphertext created from encrypting the user's id to the user.
Reset password is going to accept an encrypted form of the user's id and the OTP value and reset the password.
Note: Remember to hash all passwords, use jwt to generate the token, you can use CryptoJS or any other suitable library to encrypt/decrypt the user's id. You can use either the AES or DES algorithm.
