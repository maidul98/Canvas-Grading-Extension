Below are the steps to properly run ESLint on either the frontend or backend; ESLint is used to ensure
proper code style and consistent formatting throughout the project. These configurations can be changed by
editing the .eslintrc.json file within the backend or frontend respectively. For information on the rulesets,
please check out https://eslint.org/docs/rules/

Steps:

1. Navigate to the frontend/backend folder via a command line interface (i.e. windows powershell)

2. If ESLint is not already installed please enter: "npm install eslint --save-dev" or 
"yarn add eslint --dev"

3. Now you can run ESLint on any file or directory like so: "npx eslint yourfile.js" (to run in current 
directory you can do something like "npx eslint . "

4. To automatically fix problems such as line spacing, tabs, or missing semicolons you can add the fix option
like so: "npx eslint thisdirectory --fix"; check out more options here: https://eslint.org/docs/user-guide/command-line-interface

5. Other errors will have to be fixed manually, but otherwise this is all you need to know! Feel free to 
contact me if you have any issues or if any confusion remains...

-Alex Lee (cal368)