document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search");
    const username = document.getElementById("username");
    const stats = document.querySelector(".stats");
    const easy = document.querySelector(".easy");
    const medium = document.querySelector(".medium");
    const hard = document.querySelector(".hard");
    const easyLvl = document.getElementById("easy-lvl");
    const mediumLvl = document.getElementById("medium-lvl");
    const hardLvl = document.getElementById("hard-lvl");
    const cardStats = document.querySelector(".stats-card");

    function isValidLeetCodeUsername(username) {
        if (username.trim() === "") {
            alert("Username cannot be empty.");
            return false;
        }
        let regex = /^[a-zA-Z0-9_]{4,16}$/;
        if (!regex.test(username)) {
            alert("Invalid username.");
            return false;
        }
        return regex.test(username);
    }

    async function fetchData(username) {
        try {
            searchButton.textContent = "searching...";
            searchButton.disabled = true;

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
                redirect: "follow",
            };
            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const parsedData = await response.json();
            console.log("Logging data..", parsedData);
            displayUserData(parsedData);
        } catch (error) {
            stats.innerHTML = "Error fetching data. Please try again later.";
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgressBar(circle, solved, total, level) {
        const progressData = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressData}%`);
        level.innerHTML = `${solved} / ${total}`;
    }
    function displayUserData(parsedData) {
        const totalCount = parsedData.data.allQuestionsCount[0].count;
        const easyCount = parsedData.data.allQuestionsCount[1].count;
        const mediumCount = parsedData.data.allQuestionsCount[2].count;
        const hardCount = parsedData.data.allQuestionsCount[3].count;
        const totalSolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const easySolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const mediumSolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const hardSolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgressBar(easy, easySolved, easyCount, easyLvl);
        updateProgressBar(medium, mediumSolved, mediumCount, mediumLvl);
        updateProgressBar(hard, hardSolved, hardCount, hardLvl);

        easy.style.display = "flex";
        medium.style.display = "flex";
        hard.style.display = "flex";

        const cardsStats = [
            {
                title: "Total Submissions",
                value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions

            },
            {
                title: "Accepted Submissions",
                value: parsedData.data.matchedUser.submitStats.acSubmissionNum[0].submissions
            }
        ]
        cardStats.innerHTML = cardsStats.map((cardsStats) => {
            return `
                <div class="card">
                    <h3>${cardsStats.title}</h3>
                    <p>${cardsStats.value}</p>
                </div>`
        }).join("");
        cardStats.style.display = "flex";
        
    }
    searchButton.addEventListener("click", function () {
        const usernameValue = username.value;
        console.log("Logging Username: ", usernameValue);
        if (isValidLeetCodeUsername(usernameValue)) {
            fetchData(usernameValue);
        }
    });

});