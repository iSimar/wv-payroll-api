# wv-payroll-api
### By Simar Singh (mail@simarsingh.com)


## API Documentation 
API Documentation is hosted on Postman, [click here](https://documenter.getpostman.com/view/13333658/TVejiApd) to view it.


## Run API on Local Machine with one line
Ideally on Mac OS

If you don't have docker installed, [click here](https://docs.docker.com/get-docker/) and install docker on your machine first.
```
$ docker pull 23singh/ws-payroll-api:latest && docker run -d -p 3000:3000 --name node-app 23singh/ws-payroll-api
```

## Check if API is running

```
$ curl --location --request GET 'http://localhost:3000/payroll-report'
```

Expected Response
```
{"payrollReport":{"employeeReports":[]}}
```

[Click here](https://documenter.getpostman.com/view/13333658/TVejiApd) for full API documentaion with all endpoints.

## Test Cases

Postman file under postman directory also has test cases checking for proper responses for each of the endpoints.

## Q&A

- How did you test that your implementation was correct?
  - Used the example input provided, also used the bigger file and manually checked if the response was as expected and adding up the numbers correctly.
- If this application was destined for a production environment, what would you add or change?
  - It currently uses sqlite database which is basically a file, I would use a more scaleable database like postgres. I would also harden the code even more checking every parameter, covering all sorts of edge cases.
- What compromises did you have to make as a result of the time constraints of this challenge?
  - I could have probably hardened the code, covering lots of edge cases.