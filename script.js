async function analyzeData() {

    try {

        const input =
            document.getElementById("inputData").value;

        const parsedInput = JSON.parse(input);

        const response = await fetch(
            "https://chitkara-qualifier1.onrender.com/bfhl",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: parsedInput
                })
            }
        );

        const result = await response.json();

        document.getElementById("output").textContent =
            JSON.stringify(result, null, 2);

    } catch (error) {

        document.getElementById("output").textContent =
            error.message;
    }
}