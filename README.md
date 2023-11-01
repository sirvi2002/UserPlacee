# UserPlacee

backend folder 
  - public ( having frontend code )
  - backend folder is only used by heroku
  - locally run using ( npm run dev)

frontend code
  - after making changes in frontend, build ( npm run build ) and copy build folder data in backend/public
	- can run serve from build frontend/build ( serve using env.production  same as backend folder)


for any change in code push into github (Main folder ) 
	- add remote repo (git remote add origin https://github.com/sirvi2002/UserPlacee.git)
	- git push origin master  

for making changes in any heroku push (backend folder)
	- git add .
	- git commit -m "message"
	- add remote repo (git remote add heroku https://git.heroku.com/userplace.git)
	- git push origin master
