# 🚀 Deployment Guide - Push to GitHub

## Prerequisites

**Git is required but not installed on your system.**

### Step 1: Install Git
1. Download Git for Windows from: **https://git-scm.com/download/win**
2. Run the installer with default settings
3. Restart PowerShell/Terminal
4. Verify installation:
   ```powershell
   git --version
   ```

---

## Deployment Steps

### Step 2: Initialize Git Repository (If Not Already Done)
```powershell
cd "C:\Users\himal.shrestha\Desktop\Personal-Website"
git init
git config user.name "Himal Shrestha"
git config user.email "shresthahimal12@Yahoo.com"
```

### Step 3: Add Remote Repository
```powershell
git remote add origin https://github.com/9bitbin/9bitbin.github.io.git
```

### Step 4: Stage All Changes
```powershell
git add .
```

### Step 5: Create Initial Commit
```powershell
git commit -m "Initial commit: Personalized vaporwave portfolio with Himal Shrestha's content, Courier New typography, and enhanced styling"
```

### Step 6: Push to GitHub
```powershell
git branch -M main
git push -u origin main
```

---

## Detailed Commit Changes

### **Personalization Updates**
- ✅ Updated all page titles with "Himal Shrestha"
- ✅ Changed homepage headline to "IT Specialist | Human-Centered Technology"
- ✅ Added complete personalized bio to about page
- ✅ Updated resume with real work experience and education
- ✅ Added actual email: shresthahimal12@Yahoo.com
- ✅ Added GitHub link: github.com/9bitbin
- ✅ Added LinkedIn link: linkedin.com/in/himalstha
- ✅ Set location to New York
- ✅ Added languages: English, Nepali, Mandarin Chinese

### **Styling Updates**
- ✅ Changed all fonts from Orbitron to Courier New
- ✅ Removed Google Fonts import from all 7 HTML files
- ✅ Updated 10 font-family CSS declarations to Courier New
- ✅ Enhanced glass panels with vaporwave gradient
- ✅ Updated neon text effects with cyan-magenta glow
- ✅ Enhanced chrome buttons with vaporwave gradient and glow
- ✅ Updated navigation links with vaporwave colors
- ✅ Enhanced XP title bars with vaporwave gradient
- ✅ Updated section titles with vaporwave pink color
- ✅ Updated page subtitles with cyan glow effects

### **Files Modified**
```
- index.html (title, hero section, splash screen)
- about.html (title, profile, extended bio, interests, languages)
- blog.html (title)
- diary.html (title)
- resume.html (title, complete content with experience/education)
- contact.html (title, contact info, links)
- admin.html (title)
- styles.css (typography, colors, effects)
- README.md (updated with new content and changes)
```

---

## Troubleshooting

### If you get "Permission denied" or SSH errors:
Use HTTPS instead of SSH:
```powershell
git remote set-url origin https://github.com/9bitbin/9bitbin.github.io.git
git push -u origin main
```

### If you get "Repository not found":
Make sure the repository exists at: https://github.com/9bitbin/9bitbin.github.io

### If you need to authenticate:
- Use your GitHub username and personal access token (create one at github.com/settings/tokens)
- Or use GitHub CLI: `gh auth login`

---

## Verify Deployment

After pushing, verify your changes on GitHub:
1. Go to: **https://github.com/9bitbin/9bitbin.github.io**
2. Check that all files are updated
3. Your portfolio will be live at: **https://9bitbin.github.io**

---

## Next Steps

Once deployed:
- ✅ Monitor GitHub for any deployment status
- ✅ Test live site at https://9bitbin.github.io
- ✅ Make future changes using the same git workflow:
  ```powershell
  git add .
  git commit -m "Description of changes"
  git push origin main
  ```

