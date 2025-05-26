function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById("search-btn");
    const searchText = document.getElementById("user-input");
    const searchStatus = document.getElementById("input-status");
    const progress = document.querySelector(".progress");
    const usernamedisplay = document.getElementById("username");
    const easySpan = document.getElementById("easy-span");
    const mediumSpan = document.getElementById("medium-span");
    const hardSpan = document.getElementById("hard-span");
    const totalSpan = document.getElementById("total-span");
    const easyProgress = document.querySelector(".easy-progress");
    const mediumProgress = document.querySelector(".medium-progress");
    const hardProgress = document.querySelector(".hard-progress");
    const totalProgress = document.querySelector(".total-progress");
    const cards = document.querySelector(".stats-cards");
    const totalCard = document.querySelector(".total-card");
    const total = document.querySelector(".total");
    let username = searchText.value;

    function validateUsername(username) {

        const regex = /^[a-zA-Z_][a-zA-Z0-9_]{2,19}$/;
        if(!regex.test(username) || username.trim() === "") {
            searchText.style.borderColor = "red";
            searchStatus.textContent = "Invalid ❌";
            searchStatus.style.color = "red";
            searchButton.disabled = true;
        } else {
            searchText.style.borderColor = "green";
            searchStatus.textContent = "Valid ✅";
            searchStatus.style.color = "green";
            searchButton.disabled = false;
        }
            
        return regex.test(username);
    }

    

    async function fetchUsername(username) {


        try {
            console.log("yes");
            searchButton.textContent = "Searching";
            searchButton.disabled = true;
            searchText.disabled = true;
            searchText.value = username;


            const proxyUrl = 'https://cors-anywhere.herokuapp.com/' 
            const targetUrl = 'https://leetcode.com/graphql/';
            
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            if(!response.ok) {
                throw new Error("Unable to fetch the User details");
            }
            const parsedata =await response.json();

            
            displayUserData(parsedata);
        }

        catch(error) {
            console.log("error");
            console.error(error);
            usernamedisplay.textContent = "no data found";
            progress.style.display = "none";
            cards.style.display = "none";
            total.style.display = "none";
            document.body.style.height = "100vmin";

        }

        finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
            searchText.disabled = false;
            searchText.value = "";
        }

    }

    function displayUserData(parsedata) {

        usernamedisplay.textContent = `${username}`;
        progress.style.display = "flex";
        cards.style.display = "flex";
        total.style.display = "flex";
        document.body.style.height = "1000px";

        const totalQuestions = parsedata.data.allQuestionsCount[0].count;
        const easyTotalQuestions = parsedata.data.allQuestionsCount[1].count;
        const mediumTotalQuestions = parsedata.data.allQuestionsCount[2].count;
        const hardTotalQuestions = parsedata.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedata.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const easySolvedTotalQues = parsedata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const mediumSolvedTotalQues = parsedata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const hardSolvedTotalQues = parsedata.data.matchedUser.submitStats.acSubmissionNum[3].count;
        
        updateProgress(easySolvedTotalQues,easyTotalQuestions,easySpan,easyProgress);
        updateProgress(mediumSolvedTotalQues,mediumTotalQuestions,mediumSpan,mediumProgress);
        updateProgress(hardSolvedTotalQues,hardTotalQuestions,hardSpan,hardProgress);
        updateProgress(solvedTotalQues,totalQuestions,totalSpan,totalProgress);



        const cardsData = [
            {label: "Overall Submissions", value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            {label: "Overall Easy Submissions", value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            {label: "Overall Medium Submissions", value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            {label: "Overall Hard Submissions", value:parsedata.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
        ];

        cards.innerHTML = cardsData.map (
            (data,index) => {
                if(index !=0)  
                    return `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                    </div>`
        }).join("")

        
        totalCard.innerHTML = `<div>
                    <h4>${cardsData[0].label}</h4>
                    <p>${cardsData[0].value}</p>
                    </div>`;



        
    }

    function updateProgress(solvedQuestions,totalQuestions,span,progress) {
        span.textContent = `${solvedQuestions}/${totalQuestions}`;
        const ratio = solvedQuestions/totalQuestions*100; 
        progress.style.setProperty("--progressdegree",`${ratio}%`);  
    }

    searchText.addEventListener('input',function() {
        username = searchText.value;
        validateUsername(username);
        console.log(username);
    });

    searchButton.addEventListener('click',function() {
        usernamedisplay.style.display = "block";    
        fetchUsername(username);
           
    });

    usernamedisplay.style.display = "none";
    progress.style.display = "none";
    cards.style.display = "none";
    total.style.display = "none";
    searchButton.disabled = true;
})
