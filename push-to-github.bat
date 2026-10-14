@echo off
echo ========================================================
echo  Pushing Campus Maintenance System to GitHub
echo  Target: https://github.com/kylomapag-cell/campus-maintenance-system.git
echo ========================================================
echo.

git push -u origin main
git push origin feature/database
git push origin feature/login
git push origin feature/request-form
git push origin feature/student-dashboard
git push origin feature/access-control

echo.
echo ========================================================
echo  Push Complete! Check your repository on GitHub.
echo ========================================================
pause
