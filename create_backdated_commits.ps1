# Array of dates for the past month (15 dates) - keeping your existing dates
$dates = @(
    "2025-01-11T10:30:00",
    "2025-01-13T14:45:00",
    "2025-01-17T09:15:00",
    "2025-01-20T16:20:00",
    "2025-01-22T11:05:00",
    "2025-01-25T13:40:00",
    "2025-01-28T15:25:00",
    "2025-01-30T10:10:00",
    "2025-02-05T17:30:00",
    "2025-02-08T12:15:00",
    "2025-02-11T14:50:00",
    "2025-02-14T09:45:00",
    "2025-02-17T16:35:00",
    "2025-02-19T11:20:00",
    "2025-02-21T13:55:00"
)

# Commit messages for Joby project
$messages = @(
    "Initial project setup with React",
    "Add dark theme and basic styling",
    "Integrate Firebase for authentication and database",
    "Add login and registration components",
    "Create job API service with RapidAPI integration",
    "Create JobCard component for displaying job listings",
    "Add JobSwiper with swipe functionality for job cards",
    "Implement resume upload component",
    "Add LikedJobs component to track saved jobs",
    "Add user profile data storage in Firestore",
    "Improve job matching algorithm based on resume keywords",
    "Implement application tracking functionality",
    "Enhance UI with responsive design improvements",
    "Fix authentication and job loading issues",
    "Final code cleanup and performance optimizations"
)

# Files to modify in each commit (using actual files from your project)
$fileGroups = @(
    @("README.md", ".gitignore", "package.json"),
    @("src/App.css"),
    @("src/services/firebase.js"),
    @("src/components/Auth/Login.js", "src/components/Auth/Register.js"),
    @("src/services/jobApi.js"),
    @("src/components/Jobs/JobCard.js"),
    @("src/components/Jobs/JobSwiper.js"),
    @("src/components/Resume/ResumeUpload.js"),
    @("src/components/Jobs/LikedJobs.js"),
    @("src/App.js"),
    @("src/services/jobApi.js", "src/components/Jobs/JobSwiper.js"),
    @("src/components/Jobs/LikedJobs.js"),
    @("src/App.css"),
    @("src/components/Auth/Login.js", "src/services/firebase.js"),
    @("*") # Add all remaining files in the last commit
)

# Create each commit with its backdated timestamp
for ($i = 0; $i -lt $dates.Count; $i++) {
    $date = $dates[$i]
    $message = $messages[$i]
    $files = $fileGroups[$i]
    
    # Add the specified files
    if ($files -contains "*") {
        git add .
    } else {
        foreach ($file in $files) {
            git add $file
        }
    }
    
    # Set the environment variables for backdating
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    
    # Create the commit
    git commit -m $message
    
    # Clear the environment variables
    Remove-Item Env:\GIT_AUTHOR_DATE
    Remove-Item Env:\GIT_COMMITTER_DATE
    
    Write-Host "Created commit for $date with message: $message"
}

Write-Host "All backdated commits created successfully!"
Write-Host "To push to GitHub, run: git remote add origin https://github.com/YOUR_USERNAME/joby.git"
Write-Host "Then: git push -u origin main"