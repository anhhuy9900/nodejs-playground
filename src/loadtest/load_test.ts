import { loadTest } from 'loadtest'

const options = {
    url: 'http://localhost:8082/external/v1/account-payment/mode?num=A123456&pId=970416&pCode',
    maxRequests: 10,
    headers: {
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJqb2huZG9lIiwiaWF0IjoxNzI4NTQyNDgwLCJleHAiOjE3Mjg1NDYwODB9.iJDyEI_arPeZ3XJPnTCqx4vNsgUoTpZb4iPh79wQGrg',  // Include the correct authentication token
    },
}
loadTest(options, function(error: any, result: any) {
    if (error) {
        return console.error('Got an error: %s', error)
    }
    result.show()
    console.log('Tests run successfully')
})