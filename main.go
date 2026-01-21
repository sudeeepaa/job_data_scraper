package main

import "fmt"

// this struct holds everything related to a single job
// instead of passing many variables around, i keep them together
type Job struct {
	ID       int
	Title    string
	Company  string
	Location string
	Platform string
	Salary   uint // if salary is 0, it simply means not mentioned
}

// this struct is just for company specific details
// keeping this separate helps if company info grows later
type Company struct {
	Name     string
	Industry string
}

// this struct combines job info and company info
// embedding lets me access fields directly without extra nesting
type JobDetail struct {
	Job
	Company
}

func main() {

	// just printing a heading so output looks clean
	fmt.Println("JobPulse - Web Job Scraper")

	// basic app level values to show how data is stored and printed
	appName := "JobPulse"
	version := 1.0

	// total jobs and platforms i am working with
	totalJobsToProcess := 6
	platformLinkedIn := "LinkedIn"
	platformIndeed := "Indeed"

	// printing basic app info
	fmt.Printf("Application: %s (v%.1f)\n", appName, version)
	fmt.Printf("Processing %d jobs across %s and %s\n\n",
		totalJobsToProcess, platformLinkedIn, platformIndeed)

	// declaring variables without assigning values
	// go automatically assigns default values
	var missingCount int
	var emptyTitle string
	var unknownSalary uint
	var flag bool

	// printing default values to see what go assigns by default
	fmt.Println("default values when nothing is assigned:")
	fmt.Println("int:", missingCount)
	fmt.Println("string:", emptyTitle)
	fmt.Println("uint:", unknownSalary)
	fmt.Println("bool:", flag)
	fmt.Println()

	// fixed list of job ids since count is already known
	var jobIDs = [6]int{101, 102, 103, 104, 105, 106}

	// looping through job ids and printing them
	fmt.Println("job ids:")
	for i := 0; i < len(jobIDs); i++ {
		fmt.Printf("  %d\n", jobIDs[i])
	}
	fmt.Println()

	// slice is used here because jobs can grow dynamically
	var jobs []Job

	// adding job entries
	// each job is stored as a struct
	jobs = append(jobs,
		Job{101, "Go Backend Engineer", "TechCorp", "San Francisco, CA", "LinkedIn", 150000},
		Job{102, "Senior Go Developer", "CloudSys", "New York, NY", "LinkedIn", 160000},
		Job{103, "Go Software Engineer", "DataFlow", "Austin, TX", "Indeed", 140000},
		Job{104, "Backend Developer", "WebDev Inc", "Boston, MA", "LinkedIn", 145000},
		Job{105, "Golang Specialist", "FinTech Pro", "Chicago, IL", "Indeed", 155000},
		Job{106, "API Developer", "StartupXYZ", "Remote", "Indeed", 0},
	)

	// displaying all available jobs
	fmt.Println("all available jobs:")
	for i, job := range jobs {

		// printing basic job details
		fmt.Printf("%d) %s at %s (%s)\n",
			i+1, job.Title, job.Company, job.Platform)

		// checking if salary is available or not
		if job.Salary > 0 {
			fmt.Printf("   salary: $%d\n", job.Salary)
		} else {
			fmt.Println("   salary: not specified")
		}
	}
	fmt.Println()

	// map is used to group jobs based on platform
	// key is platform name and value is list of jobs
	jobsByPlatform := make(map[string][]Job)

	// placing each job into its respective platform group
	for _, job := range jobs {
		jobsByPlatform[job.Platform] =
			append(jobsByPlatform[job.Platform], job)
	}

	// printing jobs grouped by platform
	fmt.Println("jobs grouped by platform:")
	for platform, list := range jobsByPlatform {
		fmt.Printf("\n%s:\n", platform)

		for i, job := range list {
			fmt.Printf("  %d. %s (%s)\n", i+1, job.Title, job.Company)
		}
	}
	fmt.Println()

	// counters to track how many jobs come from each platform
	linkedinCount := 0
	indeedCount := 0

	// using switch to increment counters based on platform
	for _, job := range jobs {
		switch job.Platform {
		case "LinkedIn":
			linkedinCount++
		case "Indeed":
			indeedCount++
		}
	}

	// printing job counts
	fmt.Println("job count:")
	fmt.Println("linkedin:", linkedinCount)
	fmt.Println("indeed:", indeedCount)
	fmt.Println()

	// filtering and showing only high paying jobs
	fmt.Println("high paying jobs (above $150,000):")
	for _, job := range jobs {
		if job.Salary > 150000 {
			fmt.Printf("  %s at %s - $%d\n",
				job.Title, job.Company, job.Salary)
		}
	}
	fmt.Println()

	// creating a copy so original job data remains unchanged
	workingJobs := make([]Job, len(jobs))
	copy(workingJobs, jobs)

	fmt.Println("jobs before removal:", len(workingJobs))

	// removing a job by index manually
	// slices dont have a direct delete function
	removeIndex := 2
	workingJobs = append(
		workingJobs[:removeIndex],
		workingJobs[removeIndex+1:]...,
	)

	fmt.Println("jobs after removal:", len(workingJobs))
	fmt.Println()

	// showing how embedded structs simplify data access
	jobDetail := JobDetail{
		Job: Job{
			ID:       107,
			Title:    "Principal Architect",
			Location: "San Jose, CA",
			Platform: "LinkedIn",
			Salary:   180000,
		},
		Company: Company{
			Name:     "MegaTech Solutions",
			Industry: "Cloud Computing",
		},
	}

	// accessing embedded fields directly without extra dot notation
	fmt.Println("detailed job view:")
	fmt.Println("title:", jobDetail.Title)
	fmt.Println("company:", jobDetail.Name)
	fmt.Println("industry:", jobDetail.Industry)
	fmt.Println("salary:", jobDetail.Salary)
	fmt.Println()

	// calculating summary values like total and average salary
	totalSalary := uint(0)
	count := 0

	for _, job := range jobs {
		if job.Salary > 0 {
			totalSalary += job.Salary
			count++
		}
	}

	// avoiding division by zero
	if count > 0 {
		fmt.Println("summary:")
		fmt.Println("total jobs:", len(jobs))
		fmt.Println("jobs with salary:", count)
		fmt.Println("average salary:", totalSalary/uint(count))
	}
}
