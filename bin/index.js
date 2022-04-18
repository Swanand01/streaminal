#!/usr/bin/env node

const fetch = require("node-fetch");
const cheerio = require("cheerio");
const exec = require("child_process");
const inquirer = require('inquirer');
const fs = require('fs');
const tempDir = 'temp';

let ctx = {};


async function getData(query) {
	const response = await fetch(`https://thepiratebay.party/search/${query}/1/99/200,500/`);
	const data = await response.text();
	const $ = cheerio.load(data);
	const searchResults = $("#searchResult")
	const tbody = searchResults.find("tbody");
	$(tbody).find("tr").slice(0, 5).each((i, el) => {
		let name = $($(el).find("td").get(1)).text().trim();
		let magnet = $($(el).find("td").get(3)).find("a").attr("href");
		let seeders = $($(el).find("td").get(5)).text().trim();
		let leechers = $($(el).find("td").get(6)).text().trim();
		ctx[name] = {magnet, seeders, leechers};
	})
}

function deleteTemp(dir) {
	try {
		fs.rmdirSync(dir, { recursive: true });
	} catch (err) {
		console.error(`Error while deleting ${dir}.`);
	}
}


function playFile(choice) {
	console.log("Playing", choice);
	exec(`webtorrent "${ctx[choice].magnet}" --vlc -o "temp"`, (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
			return;
		}
		console.log(`stdout: ${stdout}`);
	});
}

async function main() {
	deleteTemp(tempDir);
	let answers = await inquirer
		.prompt([
			{
				name: 'query',
				message: 'Enter a search query > '
			},
		])

	let query = answers.query;
	if (!query) return;
	await getData(query);

	answers = await inquirer
	.prompt([
	  {
		type: 'list',
		name: 'choice',
		message: 'Select a file to play >',
		choices: Object.keys(ctx),
	  },
	])

	let choice  = answers.choice;
	playFile(choice);
}

main();