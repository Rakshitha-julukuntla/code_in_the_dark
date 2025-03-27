let playerName = "";
let revealCount = 3;
let currentRound = 0;
let timer;
let codeHidden = false;
let gameSecondsElapsed = 0;
let gameTimerInterval;
let score = 0;
let selectedLanguage = "python"; // Default language
let tabSwitchCount = 0;
let isInFullscreen = false;
let fullscreenWarningShown = false;

function enterFullscreen() {
    const elem = document.documentElement;
    const requestFs = elem.requestFullscreen || 
                    elem.webkitRequestFullscreen || 
                    elem.msRequestFullscreen;
    
    if (requestFs) {
        requestFs.call(elem).catch(err => {
            console.error("Fullscreen error:", err);
            // Retry aggressively
            setTimeout(() => enterFullscreen(), 500);
        });
    }
    isInFullscreen = true;
}
function skipQuestion() {
    currentRound++;
    if (currentRound >= codeSnippets.length) {
        clearInterval(gameTimerInterval);
        document.getElementById("game-container").innerHTML = `
            <h2>🎉 Congratulations, ${playerName}! 🎉</h2>
            <h3>You fixed all the codes in ${formatTime(gameSecondsElapsed)}!</h3>
            <h3>Final score: ${score} points</h3>
            <h3>Tab switches: ${tabSwitchCount}</h3>
            <button onclick="location.reload()">Play Again</button>
        `;
        
        // Add slight delay before exiting fullscreen
        setTimeout(() => {
            exitFullscreen();
        }, 1000);
        return;
    }
    loadNextCode();
}


// Show warning and re-enter fullscreen
function showExitWarning() {
    // Only show warning if we're actually in the game
    if (isInFullscreen && document.getElementById("game-container").style.display === "block") {
        // Try to re-enter fullscreen first
        enterFullscreen();
        
        // Then show the warning if still not in fullscreen
        setTimeout(() => {
            if (!isInFullscreen) {
                alert(`⚠️ Warning! You've switched tabs ${tabSwitchCount} time(s).\nThe game requires fullscreen mode.`);
                enterFullscreen();
            }
        }, 300);
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        tabSwitchCount++;
        // Immediately attempt to regain fullscreen
        enterFullscreen();
    }
});

// Prevent context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    alert("Right-click is disabled during the game!");
});

function handleFullscreenChange() {
    isInFullscreen = !!document.fullscreenElement || 
                   !!document.webkitFullscreenElement || 
                   !!document.msFullscreenElement;
    
    // If game is active and not in fullscreen, force it back
    if (!isInFullscreen && document.getElementById("game-container").style.display === "block") {
        // Show brief notification instead of confirm()
        const warning = document.createElement('div');
        warning.textContent = "⚠️ Auto-returning to fullscreen mode...";
        warning.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:red; color:white; padding:10px; z-index:9999; border-radius:5px;";
        document.body.appendChild(warning);
        
        setTimeout(() => warning.remove(), 2000);
        
        // Force re-entry without user interaction
        setTimeout(() => enterFullscreen(), 300);
    }
}// Use a single handler for all browser variants
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);


// Language-specific code snippets
const allCodeSnippets = {
    python: [
        {
            buggy: "def find_first_last(arr, x):\n    first = -1\n    last = -1\n\n    for i in range(len(arr)):\n        if arr[i] == x:\n            if first == -1:\n                first = i\n            last = i\n\n    return first, last\n\narr = [2, 3, 5, 3, 7, 3, 8]\nX = 3\n\nresult = find_first_last(arr, x)",
            correct: "result = find_first_last(arr, X)"
        },
        {
            buggy: "def matrix_addition(mat1, mat2):\n    n = len(mat1)\n    m = len(mat1[0])\n    result = [[0] * m for _ in range(n)]\n\n    for i in range(n + 1):  # Error: Accessing out-of-bounds index\n        for j in range(m):\n            result[i][j] = mat1[i][j] + mat2[i][j]\n\n    return result",
            correct: "for i in range(n):"
        },
        {
            buggy: "def lower_triangle_sum(matrix):\n    n = len(matrix)\n    total = 0\n\n    for i in range(n):\n        for j in range(i + 2):  # Error: Accessing out-of-bounds index\n            total += matrix[i][j]\n\n    return total",
            correct: "for j in range(i + 1):"
        },
        {
            buggy: "def reverse_number(n):\n    rev = \"\"\n    while n != 0:\n        rem = n % 10\n        rev = rev + rem  # Error: Trying to concatenate int to str\n        n //= 10\n    return int(rev)",
            correct: "rev = rev + str(rem)"
        },
        {
            buggy: "def power(a, b):\n    res = 1\n    for i in range(b):\n        res *= a\n    return result  # Error: `result` is not defined (should be `res`)",
            correct: "return res"
        },
        {
            buggy: "def find_maximum(arr):\n    max_value = arr[0]\n    for i in range(len(arr) + 1):  # Error: Loop goes out of bounds\n        if arr[i] > max_value:\n            max_value = arr[i]\n    return max_value",
            correct: "for i in range(len(arr)):"
        },
        {
            buggy: "def sum_odd_even(arr):\n    oddsum, evensum = 0, 0\n    for i in range(len(arr)):\n        if arr[i] % 2 == 0:\n            evensum += arr[i]\n        else:\n            oddsum += arr[i]\n    \n    return oddsum + \" \" + evensum  # Error: Trying to concatenate int and str",
            correct: "return f\"{oddsum} {evensum}\""
        },
        {
            buggy: "def find_duplicate(arr):\n    for i in range(len(arr)):\n        for j in range(i + 1, len(arr)):\n            if arr[i] == arr[j]:\n                dup = arr[i]  # Error: `dup` may never be assigned if no duplicate exists\n    return dup",
            correct: "return None  # or initialize dup = None before the loops"
        },
        {
            buggy: "def factorial(n):\n    for i in range(1, n + 1):\n        fact *= i  # Error: `fact` is not initialized before use\n    return fact",
            correct: "fact = 1\n    for i in range(1, n + 1):"
        },
        {
            buggy: "def fibonacci(n):\n    if n == 0:\n        return 0\n    if n == 1:\n        return 1\n\n    a, b = 0, 1\n    for i in range(2, n + 1):\n        fib = a + b\n        a = b\n        b = fib\n\n    return fib_value  # Error: `fib_value` is not defined (should be `fib`)",
            correct: "return fib"
        }
    ],
    c: [
        {
            buggy: "#include <stdio.h>\n\nvoid matrix_addition(int mat1[3][3], int mat2[3][3], int result[3][3]) {\n    int n = 3, m = 3;\n    for (int i = 0; i <= n; i++) { // Error: Out-of-bounds access\n        for (int j = 0; j < m; j++) {\n            result[i][j] = mat1[i][j] + mat2[i][j];\n        }\n    }\n}",
            correct: "for (int i = 0; i < n; i++)"
        },
        {
            buggy: "#include <stdio.h>\n\nint lower_triangle_sum(int matrix[3][3]) {\n    int n = 3, total = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < i + 2; j++) { // Error: Out-of-bounds access\n            total += matrix[i][j];\n        }\n    }\n    return total;\n}",
            correct: "for (int j = 0; j <= i; j++)"
        },
        {
            buggy: "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint reverse_number(int n) {\n    char rev[20] = \"\";\n    while (n != 0) {\n        int rem = n % 10;\n        rev = rev + rem; // Error: Invalid concatenation\n        n /= 10;\n    }\n    return atoi(rev);\n}",
            correct: "char rem_str[2];\n        sprintf(rem_str, \"%d\", rem);\n        strcat(rev, rem_str);"
        },
        {
            buggy: "#include <stdio.h>\n\nint power(int a, int b) {\n    int res = 1;\n    for (int i = 0; i < b; i++) {\n        res *= a;\n    }\n    return result; // Error: `result` is undefined\n}",
            correct: "return res;"
        },
        {
            buggy: "#include <stdio.h>\n\nint find_maximum(int arr[], int size) {\n    int max_value = arr[0];\n    for (int i = 0; i <= size; i++) { // Error: Out-of-bounds access\n        if (arr[i] > max_value) {\n            max_value = arr[i];\n        }\n    }\n    return max_value;\n}",
            correct: "for (int i = 0; i < size; i++)"
        },
        {
            buggy: "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nchar* sum_odd_even(int arr[], int size) {\n    int oddsum = 0, evensum = 0;\n    for (int i = 0; i < size; i++) {\n        if (arr[i] % 2 == 0)\n            evensum += arr[i];\n        else\n            oddsum += arr[i];\n    }\n    return oddsum + \" \" + evensum; // Error: Invalid concatenation\n}",
            correct: "char* result = malloc(50);\n    sprintf(result, \"%d %d\", oddsum, evensum);\n    return result;"
        },
        {
            buggy: "#include <stdio.h>\n\nint find_duplicate(int arr[], int size) {\n    int dup;\n    for (int i = 0; i < size; i++) {\n        for (int j = i + 1; j < size; j++) {\n            if (arr[i] == arr[j]) {\n                dup = arr[i]; // Error: `dup` might not be initialized\n            }\n        }\n    }\n    return dup; // Error: May return an uninitialized value\n}",
            correct: "int dup = -1; // Initialize with a default value\n    // ... rest of the code\n    return dup;"
        },
        {
            buggy: "#include <stdio.h>\n\nint factorial(int n) {\n    int fact;\n    for (int i = 1; i <= n; i++) {\n        fact *= i; // Error: `fact` is uninitialized\n    }\n    return fact;\n}",
            correct: "int fact = 1;"
        },
        {
            buggy: "#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n == 0) return 0;\n    if (n == 1) return 1;\n    \n    int a = 0, b = 1, fib;\n    for (int i = 2; i <= n; i++) {\n        fib = a + b;\n        a = b;\n        b = fib;\n    }\n    return fib_value; // Error: `fib_value` is undefined\n}",
            correct: "return fib;"
        }
    ],
    java: [
        {
            buggy: "class MatrixAddition {\n    public static void matrixAddition(int[][] mat1, int[][] mat2, int[][] result) {\n        int n = mat1.length, m = mat1[0].length;\n        for (int i = 0; i <= n; i++) { // Error: Out-of-bounds access\n            for (int j = 0; j < m; j++) {\n                result[i][j] = mat1[i][j] + mat2[i][j];\n            }\n        }\n    }\n}",
            correct: "for (int i = 0; i < n; i++)"
        },
        {
            buggy: "class LowerTriangleSum {\n    public static int lowerTriangleSum(int[][] matrix) {\n        int n = matrix.length, total = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < i + 2; j++) { // Error: Out-of-bounds access\n                total += matrix[i][j];\n            }\n        }\n        return total;\n    }\n}",
            correct: "for (int j = 0; j <= i; j++)"
        },
        {
            buggy: "class ReverseNumber {\n    public static int reverseNumber(int n) {\n        String rev = \"\";\n        while (n != 0) {\n            int rem = n % 10;\n            rev = rev + rem; // Error: Invalid concatenation\n            n /= 10;\n        }\n        return Integer.parseInt(rev);\n    }\n}",
            correct: "rev = rev + String.valueOf(rem);"
        },
        {
            buggy: "class PowerFunction {\n    public static int power(int a, int b) {\n        int res = 1;\n        for (int i = 0; i < b; i++) {\n            res *= a;\n        }\n        return result; // Error: `result` is undefined\n    }\n}",
            correct: "return res;"
        },
        {
            buggy: "class FindMaximum {\n    public static int findMaximum(int[] arr) {\n        int maxValue = arr[0];\n        for (int i = 0; i <= arr.length; i++) { // Error: Out-of-bounds access\n            if (arr[i] > maxValue) {\n                maxValue = arr[i];\n            }\n        }\n        return maxValue;\n    }\n}",
            correct: "for (int i = 0; i < arr.length; i++)"
        },
        {
            buggy: "class SumOddEven {\n    public static String sumOddEven(int[] arr) {\n        int oddSum = 0, evenSum = 0;\n        for (int num : arr) {\n            if (num % 2 == 0)\n                evenSum += num;\n            else\n                oddSum += num;\n        }\n        return oddSum + \" \" + evenSum; // Error: Invalid concatenation\n    }\n}",
            correct: "return oddSum + \" \" + evenSum; // Actually correct in Java due to auto-string conversion"
        },
        {
            buggy: "class FindDuplicate {\n    public static int findDuplicate(int[] arr) {\n        int dup = 0;\n        for (int i = 0; i < arr.length; i++) {\n            for (int j = i + 1; j < arr.length; j++) {\n                if (arr[i] == arr[j]) {\n                    dup = arr[i]; // Error: `dup` might not be initialized\n                }\n            }\n        }\n        return dup; // Error: May return an uninitialized value\n    }\n}",
            correct: "int dup = -1; // Initialize with a default value\n        // ... rest of the code\n        return dup;"
        },
        {
            buggy: "class Factorial {\n    public static int factorial(int n) {\n        int fact;\n        for (int i = 1; i <= n; i++) {\n            fact *= i; // Error: `fact` is uninitialized\n        }\n        return fact;\n    }\n}",
            correct: "int fact = 1;"
        },
        {
            buggy: "class Fibonacci {\n    public static int fibonacci(int n) {\n        if (n == 0) return 0;\n        if (n == 1) return 1;\n        \n        int a = 0, b = 1, fib = 0;\n        for (int i = 2; i <= n; i++) {\n            fib = a + b;\n            a = b;\n            b = fib;\n        }\n        return fibValue; // Error: `fibValue` is undefined\n    }\n}",
            correct: "return fib;"
        }
    ]
};

let codeSnippets = [];

function startGame() {
    // Remove the duplicate event listener
    document.getElementById("start-btn").removeEventListener("click", startGame);
    
    playerName = document.getElementById("player-name").value.trim();
    if (playerName === "") {
        alert("Please enter your name!");
        return;
    }

    // Get the selected language
    const languageRadios = document.getElementsByName("language");
    for (const radio of languageRadios) {
        if (radio.checked) {
            selectedLanguage = radio.value;
            break;
        }
    }

    enterFullscreen();
    
    // Select 3 random code snippets for the chosen language
    codeSnippets = getRandomCodeSnippets(3, selectedLanguage);
    currentRound = 0;
    revealCount = 3;
    score = 0;

    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";

    gameSecondsElapsed = 0;
    updateGameTimer();
    updateScore();
    gameTimerInterval = setInterval(updateGameTimer, 1000);

    loadNextCode();
}function getRandomCodeSnippets(count, language) {
    const snippets = allCodeSnippets[language];
    const shuffled = [...snippets].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

document.getElementById("skip-button").addEventListener("click", skipQuestion);

function loadNextCode() {
    if (currentRound >= codeSnippets.length) {
        clearInterval(gameTimerInterval);
        fullscreenWarningShown = true; // Prevent warning when game ends
        document.getElementById("game-container").innerHTML = `
            <h2>🎉 Congratulations, ${playerName}! 🎉</h2>
            <h3>You fixed all the codes in ${formatTime(gameSecondsElapsed)}!</h3>
            <h3>Final score: ${score} points</h3>
            <h3>Tab switches: ${tabSwitchCount}</h3>
        `;
        exitFullscreen();
        return;
    }

    let currentCode = codeSnippets[currentRound];
    document.getElementById("code-display").innerText = currentCode.buggy;
    document.getElementById("code-box").value = "";
    document.getElementById("result-message").innerText = "";

    resetUIForNewRound();
    startTimer();
}

function startTimer() {
    let timeLeft = 20;
    document.getElementById("timer").innerText = `Code disappears in: ${timeLeft} sec`;
    codeHidden = false;

    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `Code disappears in: ${timeLeft} sec`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById("code-display").innerText = "Code hidden!";
            
            // Enable input and buttons when code disappears
            document.getElementById("code-box").disabled = false;
            document.getElementById("submit-btn").disabled = false;
            if (revealCount > 0) {
                document.getElementById("reveal-btn").disabled = false;
            }

            codeHidden = true;
        }
    }, 1000);
}

function checkAnswer() {
    let userInput = document.getElementById("code-box").value.trim();
    let correctAnswer = codeSnippets[currentRound].correct.trim();

    // Remove all whitespace (including newlines and tabs) for comparison
    let normalizedInput = userInput.replace(/\s+/g, ' ');
    let normalizedCorrect = correctAnswer.replace(/\s+/g, ' ');

    if (normalizedInput === normalizedCorrect) {
        score += 20;
        document.getElementById("result-message").innerText = "✅ Correct! Moving to the next level...";
        updateScore();
        setTimeout(() => {
            currentRound++;
            loadNextCode();
        }, 2000);
    } else {
        score -= 2;
        document.getElementById("result-message").innerText = "❌ Incorrect! Try Again.";
        updateScore();
    }
}
function revealCode() {
    if (revealCount > 0) {
        document.getElementById("code-display").innerText = codeSnippets[currentRound].buggy;
        revealCount--;
        document.getElementById("reveal-btn").innerText = `Reveal Code (${revealCount} left)`;

        if (revealCount === 0) {
            document.getElementById("reveal-btn").disabled = true;
        }

        // Restart the timer when the code is revealed again
        resetUIForNewRound();
        startTimer();
    }
}

function resetUIForNewRound() {
    document.getElementById("code-box").disabled = true;
    document.getElementById("submit-btn").disabled = true;
    document.getElementById("reveal-btn").disabled = true;
}

document.getElementById("code-box").addEventListener("keydown", function(event) {
    if (!codeHidden) {
        event.preventDefault();
        document.getElementById("result-message").innerText = "⚠️ You can only type after the code disappears!";
        setTimeout(() => {
            document.getElementById("result-message").innerText = "";
        }, 2000); // Clear message after 2 seconds
    }
});

document.getElementById("code-box").addEventListener('drop', (e) => {
    e.preventDefault();
    document.getElementById("result-message").innerText = "⚠️ Dragging text is disabled!";
    setTimeout(() => {
        document.getElementById("result-message").innerText = "";
    }, 2000);
});

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        document.getElementById("result-message").innerText = "⚠️ Pasting is disabled!";
        setTimeout(() => {
            document.getElementById("result-message").innerText = "";
        }, 2000);
    }
});


function updateGameTimer() {
    gameSecondsElapsed++;
    let minutes = Math.floor(gameSecondsElapsed / 60);
    let seconds = gameSecondsElapsed % 60;
    document.getElementById("game-timer").innerText = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateScore() {
    document.getElementById("game-score").innerText = `Score: ${score}`;
}

function skipQuestion() {
    currentRound++;
    if (currentRound >= codeSnippets.length) {
        clearInterval(gameTimerInterval);
        document.getElementById("game-container").innerHTML = `
            <h2>🎉 Congratulations, ${playerName}! 🎉</h2>
            <h3>You fixed all the codes in ${formatTime(gameSecondsElapsed)}!</h3>
            <h3>Final score: ${score} points</h3>
            <h3>Tab switches: ${tabSwitchCount}</h3>
        `;
        exitFullscreen(); // Exit fullscreen when game ends
        return;
    }
    loadNextCode();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
// Disable copy-paste functionality
document.addEventListener('copy', (e) => {
    e.preventDefault();
    alert("Copying is disabled in this game!");
});

document.addEventListener('paste', (e) => {
    e.preventDefault();
    alert("Pasting is disabled in this game!");
});

document.addEventListener('cut', (e) => {
    e.preventDefault();
    alert("Cutting is disabled in this game!");
});

// Disable right-click context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    alert("Right-click menu is disabled in this game!");
});

