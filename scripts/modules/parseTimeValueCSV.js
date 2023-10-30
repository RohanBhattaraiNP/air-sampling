function parseTimeValueCSV(csv) {
    const parsedCsv = [];

    const rows = csv.trim().split("\n");

    for(const row of rows) {
        const [time, value] = row.split(",");

        parsedCsv.push({
            time,
            value: parseFloat(value)
        })
    }

    return parsedCsv;
};

export default parseTimeValueCSV;