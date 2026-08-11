declare module 'aes-js' {
  const aesjs: any;
  export default aesjs;
}
//aes-js encrypt the data/session token before storing in the expo-secure-store/async storage for the security purpose.


// Added this file Because aes-js is a pure javascript library and it is not having types but in our tsconfig.json we have enabled strict mode true so it was giving error so i have added this file.