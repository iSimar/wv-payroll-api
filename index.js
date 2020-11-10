const fs = require('fs')
const express = require('express')
const fileUpload = require('express-fileupload')
const csv = require('csv-parser')
const sqlite3 = require('sqlite3').verbose()
const app = express()
const port = 3000

const db = new sqlite3.Database('./db/db.sqlite')
 
db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS time_report_entries (date INTEGER, month INTEGER, year INTEGER, hours_worked REAL, employee_id INTEGER, pay_group TEXT)")
})

const payGroup = {
    A: 20,
    B: 30
}

app.use(fileUpload({
    createParentPath: true
}))

app.post('/time-report', (req, res) => {

    if(!req.files) {
        return res.send({ message: 'No file uploaded' })
    }

    const timeReport = req.files.timeReport

    if (!timeReport) {
        return res.send({ message: 'timeReport file not included' })
    }

    const filePath = './uploads/' + timeReport.name

    try {

        if (fs.existsSync(filePath)) {
            return res.send({ message: 'timeReport file already exists' })
        }

        timeReport.mv(filePath, () => {

            var stmt = db.prepare("INSERT INTO time_report_entries VALUES (?, ?, ?, ?, ? , ?)")

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    const row = Object.keys(data).map(key => data[key])
                    const date = row[0].split("/").map(o => parseInt(o))
                    const args = [date[0], date[1], date[2], parseInt(row[1]), parseFloat(row[2]), row[3]]
                    stmt.run(...args)
                })
                .on('end', () => {
                    stmt.finalize()
                })

        })

        return res.send({ message: 'timeReport file uploaded successfully' })
    } catch(err) {
        console.error(err)
        return res.send({ message: 'internal error' })
    }

})

function lastDayOfMonth(year, month){
    return new Date(year, month-1, 0).getDate()
}

app.get('/payroll-report', (req, res) => {
    const json = {
        payrollReport: {
            employeeReports: [
            ]
        }
    }
    let employeePeriod = null
    db.all("SELECT date, month, year, hours_worked, employee_id, pay_group FROM time_report_entries ORDER BY employee_id ASC, year ASC, month ASC, date ASC", function(err, rows) {
        
        if (err) {
            throw err
        }
        rows.forEach((row, index) => {
            

            // console.log(row.employee_id, " ",row.year, " ", row.month, " ", row.date, " = $", payGroup[row.pay_group] * row.hours_worked)
            
            if (!employeePeriod ||
                (employeePeriod && employeePeriod.employeeId != row.employee_id) ||
                (employeePeriod && parseInt(employeePeriod.payPeriod.endDate.split("-")[0]) != row.year) ||
                (employeePeriod && parseInt(employeePeriod.payPeriod.endDate.split("-")[1]) != row.month) ||
                (parseInt(employeePeriod.payPeriod.endDate.split("-")[2]) < row.date)
                ) {

                if (employeePeriod) {
                    employeePeriod.amountPaid = `$${employeePeriod.amountPaid.toFixed(2)}`
                    json.payrollReport.employeeReports.push(employeePeriod)
                }

                let startDay = row.date > 15 ? 16 : 1
                let endDay = row.date > 15 ? lastDayOfMonth(row.year, row.month) : 15
                employeePeriod = {
                    employeeId: row.employee_id,
                    payPeriod: {
                        startDate: `${row.year}-${("0" + row.month).slice(-2)}-${("0" + startDay).slice(-2)}`,
                        endDate: `${row.year}-${("0" + row.month).slice(-2)}-${("0" + endDay).slice(-2)}`
                    },
                    amountPaid: payGroup[row.pay_group] * row.hours_worked
                }
            } else {
                employeePeriod.amountPaid += payGroup[row.pay_group] * row.hours_worked
            }
    
            if (rows.length-1 == index && employeePeriod) {
                employeePeriod.amountPaid = `$${employeePeriod.amountPaid.toFixed(2)}`
                json.payrollReport.employeeReports.push(employeePeriod)
            }





        })
        
        
        res.send(json)
        
    })
})

app.listen(port, () => {
  console.log(`wv-payroll-api listening at http://localhost:${port}`)
})
