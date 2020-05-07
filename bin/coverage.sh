#!bin/bash

NODE_ENV=test nyc npm t
NODE_ENV=test nyc report --reporter=text-summary
NODE_ENV=test nyc report --reporter=lcov
cat ./coverage/lcov.info | ./node_modules/.bin/codacy-coverage && rm -rf ./coverage