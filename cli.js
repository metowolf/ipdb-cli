#!/usr/bin/env node
'use strict'
const net = require('net')
const meow = require('meow')
const chalk = require('chalk')
const readline = require('readline')
const IPDB = require('ipdb')
const database = require('@ipdb/database')

const ipdb = new IPDB(database)

const cli = meow(`
    Usage
      $ ipdb [ip]

    Examples
      $ ipdb 8.8.8.8
      $ dig www.google.com | ipdb
`, {
  flags: {}
})

const format = ip => {
  if (!net.isIP(ip)) {
    return ip
  }

  const info = ipdb.find(ip)
  if (info.code) {
    return ip
  }

  const keyname = ['country_name', 'region_name', 'city_name', 'isp_domain']
  let result = []
  for (let i = 0; i < keyname.length; i += 1) {
    if (info.data[keyname[i]]) {
      if (!i || info.data[keyname[i]] !== info.data[keyname[i - 1]]) {
        result.push(info.data[keyname[i]])
      }
    }
  }

  result = result.join(' ').trim()
  result = chalk.gray(`[${result}]`)

  return `${ip} ${result}`
}

if (cli.input.length) {
  for (let ip of cli.input) {
    console.log(format(ip))
  }
}

if (!cli.input.length) {

  const regex_ipv4 = new RegExp('(\\d{1,3}(\\.\\d{1,3}){3})\\S', 'g')

  const stdin = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })

  stdin.on('line', line => {
    console.log(line.replace(regex_ipv4, format))
  })
}
