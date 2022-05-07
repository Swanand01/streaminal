#!/usr/bin/env node

const fetch = require("node-fetch");
const cheerio = require("cheerio");
const exec = require("child_process").exec;
const inquirer = require('inquirer');
const rimraf = require("rimraf");
const figlet = require('figlet');
const gradient = require('gradient-string');

const tempDir = 'temp';

let ctx = [];


async function getData(query) {
	const response = await fetch(`https://thepiratebay.party/search/${query}/1/99/200,500/`);
	const data = await response.text();
	const $ = cheerio.load(data);
	const searchResults = $("#searchResult")
	const tbody = searchResults.find("tbody");
	$(tbody).find("tr").slice(0, 10).each((i, el) => {
		let name = $($(el).find("td").get(1)).text().trim();
		let magnet = $($(el).find("td").get(3)).find("a").attr("href");
		let seeders = $($(el).find("td").get(5)).text().trim();
		let leechers = $($(el).find("td").get(6)).text().trim();
		ctx.push({ name, magnet, seeders, leechers });
	})
}

function deleteTemp(dir) {
	try {
		rimraf.sync(dir);
	} catch (err) {
		console.error(`Error while deleting ${dir}.`);
	}
}


function playFile(choice) {
	console.log("Playing", ctx[choice].name);
	exec(`webtorrent "${ctx[choice].magnet}" --vlc -o "temp" -q`, (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return; // Change to process.exit(1) ?
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
			return;
		}
		// Could put deleteTemp() here
		console.log("Exiting...");
	});
}

function showBanner() {
	console.log(gradient.retro(figlet.textSync('Streaminal', {
		horizontalLayout: 'default',
		verticalLayout: 'default',
	})));
}

async function getSearchQuery() {
	let answers = await inquirer
		.prompt([
			{
				name: 'query',
				message: 'Enter a search query > '
			},
		])

	let query = answers.query;
	if (!query) process.exit(1);

	return query;
}

async function main() {
	showBanner();
	deleteTemp(tempDir);

	let query = await getSearchQuery();

	await getData(query);

	while (Object.keys(ctx).length === 0) {
		console.log("No results found");
		let query = await getSearchQuery();
		await getData(query);
	}

	let torrentInfoArray = ctx.map((torr) => {
		return torr.name + " SE: " + torr.seeders + " LE: " + torr.leechers
	});
	answers = await inquirer
		.prompt([
			{
				type: 'list',
				name: 'choice',
				message: 'Select a file to play >',
				choices: torrentInfoArray,
				loop: false,
				pageSize: 10
			},
		])

	let choice = torrentInfoArray.indexOf(answers.choice);
	playFile(choice);
}

main();