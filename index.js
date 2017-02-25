/* jslint node:true, esnext:true */
'use strict';

var https = require('https'),
    querystring = require('querystring');

class Betfair {

    /**
     * @contructor
     * @param {string} appKey - Betfair application key
     * @param {string} [username] - Betfair username
     * @param {string} [password] - Betfair password
     * @param {boolean} [keepAlive=false] - Keep token alive till logout
     */
    constructor(appKey, username, password, keepAlive) {
        this.appKey = appKey;
        this.authKey = '';
        this.username = username || '';
        this.password = password || '';
        this.keepAlive = keepAlive || false;
        this.keepAliveTimeout = 3600000;

        this.login();
    }

    /**
     * @param {string} [username] - Betfair username
     * @param {string} [password] - Betfair password
     * @param {boolean} [keepAlive] - Keep token alive till logout
     */
    login (username, password, keepAlive) {
        this.keepAlive = keepAlive || this.keepAlive;

        return this.request('identitysso.betfair.com', '/api/login', 'application/x-www-form-urlencoded', {
            username: username || this.username,
            password: password || this.password
        }).then((response) => {
            this.authKey = response.token;
            if (this.keepAlive) {
                setTimeout(() => {
                    this.keepAliveReset();
                }, this.keepAliveTimeout);
            }
        });
    }

    logout () {
        this.keepAlive = false;
        return this.request('identitysso.betfair.com', '/api/logout');
    }

    keepAliveReset () {
        if (this.keepAlive) {
            this.request('identitysso.betfair.com', '/api/keepAlive').then((response) => {
                if (response.status === 'FAIL') {
                    this.login();
                } else {
                    setTimeout(() => {
                        this.keepAliveReset();
                    }, this.keepAliveTimeout);
                }
            });
        }
    }

    /**
     * @param {object} filter - Filter options (refer to betfair docs)
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getEventTypes (filter) {
        return this.devApi('listEventTypes', {
            "filter": filter
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} filter - Filter options (refer to betfair docs)
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getCompetitions (filter) {
        return this.devApi('listCompetitions', {
            "filter": filter
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} filter - Filter options (refer to betfair docs)
     * @param {string} granularity - DAYS/HOURS/MINUTES
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getTimeRanges (filter, granularity) {
        return this.devApi('listTimeRanges', {
            "filter": filter,
            "granularity": granularity
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} filter - Filter options (refer to betfair docs)
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getEvents (filter) {
        return this.devApi('listEvents', {
            "filter": filter
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} filter - Filter options (refer to betfair docs)
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getMarketTypes (filter) {
        return this.devApi('listMarketTypes', {
            "filter": filter
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} filter - Filter options (refer to betfair docs)
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getCountries (filter) {
        return this.devApi('listCountries', {
            "filter": filter
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} filter - Filter options (refer to betfair docs)
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getVenues (filter) {
        return this.devApi('listVenues', {
            "filter": filter
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} filter - Filter options (refer to betfair docs)
     * @param {string} maxResults - Filter options (refer to betfair docs)
     * @todo add opts object for optional args
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getMarketCatalogue (filter, maxResults) {
        return this.devApi('listMarketCatalogue', {
            "filter": filter,
            "maxResults": maxResults
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {array} marketIds - array of market ids
     * @param {number} maxResults - number of max results to return
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     * @todo add opts object for optional args, move priceProjection into it
     */
    getMarketBook (marketIds,  priceProjection) {
        return this.devApi('listMarketBook', {
            "marketIds": marketIds,
            "priceProjection": priceProjection
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} [params] - optional parameters (refer to betfair docs)
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getMarketProfitAndLoss (params) {
        return this.devApi('listMarketProfitAndLoss', params || {}).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} [params] - optional parameters (refer to betfair docs)
     */
    getCurrentOrders (params) {
        return this.devApi('listCurrentOrders', params).then((response) => {
            return response;
        });
    }

    /**
     * @param {object} [params] - optional parameters (refer to betfair docs)
     * @return {Promise<Array>} - Promise that resolves with the results in an array
     */
    getClearedOrders (params) {
        return this.devApi('listClearedOrders', params).then((response) => {
            return response;
        });
    }

    /**
     * @param {string} marketId - Id of market to bet in
     * @param {array<Object>} instructions - Array of placeInstruction objects {@link Betfair.buildPlaceInstruction}
     * @todo add opts object for optional args
     */
    placeOrders (marketId, instructions) {
        return this.devApi('placeOrders', {
            marketId: marketId,
            instructions: instructions
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {string} marketId - Id of market bet was made
     * @param {array<Object>} instructions - Array of placeInstruction objects {@link Betfair.buildCancelInstruction}
     * @todo add opts object for optional args
     */
    cancelOrders (marketId, instructions) {
        return this.devApi('cancelOrders', {
            marketId: marketId,
            instructions: instructions
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {string} marketId - Id of market bet was made
     * @param {array<Object>} instructions - Array of placeInstruction objects {@link Betfair.buildUpdateInstruction}
     * @todo add opts object for optional args
     */
    updateOrders (marketId, instructions) {
        return this.devApi('updateOrders', {
            marketId: marketId,
            instructions: instructions
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {string} marketId - Id of market bet was made
     * @param {array<Object>} instructions - Array of placeInstruction objects {@link Betfair.buildReplaceInstruction}
     * @todo add opts object for optional args
     */
    replaceOrders (marketId, instructions) {
        return this.devApi('replaceOrders', {
            marketId: marketId,
            instructions: instructions
        }).then((response) => {
            return response;
        });
    }

    /**
     * @param {string} selectionId - Id of selection to bet on
     * @param {number} handicap - handicap, default=0
     * @param {string} orderType - LIMIT / LIMIT_ON_CLOSE / MARKET_ON_CLOSE
     * @param {string} side - BACK / LAY
     * @param {object} limitOrder - depending on orderType: {@link Betfair.buildLimitOrder} {@link Betfair.buildMarketOnCloseOrder} {@link Betfair.buildLimitOnCloseOrder}
     */
    static buildPlaceInstruction (selectionId, handicap, orderType, side, limitOrder) {
        let orderTypeDictionary = {
            LIMIT: 'limitOrder',
            LIMIT_ON_CLOSE: 'limitOnCloseOrder',
            MARKET_ON_CLOSE: 'marketOnCloseOrder'
        },
        instruction = {
            selectionId: selectionId,
            handicap: handicap || 0,
            orderType: orderType,
            side: side,
            limitOrder: limitOrder
        };
        instruction[orderTypeDictionary[orderType]] = limitOrder;
        return instruction;
    }

    static buildLimitOrder (size, price, persistenceType, timeInForce, minFillSize, betTargetType, betTargetSize) {
        return {
            size: size,
            price: price,
            persistenceType: persistenceType,
            timeInForce: timeInForce,
            minFillSize: minFillSize,
            betTargetType: betTargetType,
            betTargetSize: betTargetSize
        };
    }

    static buildMarketOnCloseOrder (liability) {
        return {
            liability: liability
        };
    }

    static buildLimitOnCloseOrder (liability, price) {
        return {
            liability: liability,
            price: price
        };
    }

    static buildReplaceInstruction(betId, newPrice) {
        return {
            betId: betId,
            newPrice: newPrice
        };
    }

    static buildCancelInstruction (betId, sizeReduction) {
        return {
            betId: betId,
            sizeReduction: sizeReduction
        };
    }

    static buildUpdateInstruction (betId, newPersistenceType) {
        return {
            betId: betId,
            newPersistenceType: newPersistenceType
        };
    }

    // updateOrders

    /**
     * @private
     * @param {string} method - api request method
     * @param {object} params - payload parameters
     */
    devApi (method, params) {
        var def = [{
            "jsonrpc": "2.0",
            "method": "SportsAPING/v1.0/" + method,
            "params": params
        }];
        return this.request('developers.betfair.com', '/api.betfair.com/exchange/betting/json-rpc/v1', 'text/plain;charset=UTF-8', JSON.stringify(def));
    }

    /**
     * @private
     * @param {string} host - hostname of endpoint
     * @param {string} path - path of endpoint
     * @param {string} contentType - content type of payload
     * @param {object} params - payload
     */
    request (host, path, contentType, params) {
        return new Promise((resolve, reject) => {
            var options = {
                    host: host,
                    path: path,
                    port: 443,
                    method: 'POST',
                    headers: {
                        'Content-Type': contentType || 'application/json',
                        'X-Application': this.appKey,
                        'Accept': 'application/json'
                    }
                },
                httpReq;

            if (contentType === 'application/x-www-form-urlencoded') {
                params = querystring.stringify(params);
                options.headers['Content-Length'] = params.length;
            }

            if (this.authKey) {
                options.headers['X-Authentication'] = this.authKey;
            }

            httpReq = https.request(options, function (res) {
                var data = '';
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    var response = JSON.parse(data);
                    if (response) {
                        resolve(response);
                    } else {
                        reject();
                    }
                });

                res.on('error', function (err) {
                    throw new Error(err);
                });
            });
            if (params) {
                httpReq.write(params);
            }
            httpReq.end();
        });
    }
}

module.exports = Betfair;
