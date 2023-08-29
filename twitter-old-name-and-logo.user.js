// ==UserScript==
// @name         Twitter: bring back old name and logo
// @namespace    https://github.com/rybak
// @version      3
// @description  Changes the tab icon, tab name, header logo, and naming of "tweets" on Twitter
// @author       Andrei Rybak
// @license      MIT
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        GM_addStyle
// ==/UserScript==

/*
 * Copyright (c) 2023 Andrei Rybak
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function() {
	'use strict';

	const TWITTER_2012_ICON_URL = 'https://abs.twimg.com/favicons/twitter.2.ico';

	const LOG_PREFIX = "[old school Twitter]";
	const FAVICON_SELECTOR = 'link[rel="icon"], link[rel="shortcut icon"]';
	const POSTS_SELECTOR = createPostsSelector();

	function error(...toLog) {
		console.error(LOG_PREFIX, ...toLog);
	}

	function info(...toLog) {
		console.info(LOG_PREFIX, ...toLog);
	}

	function debug(...toLog) {
		console.debug(LOG_PREFIX, ...toLog);
	}

	// from https://stackoverflow.com/a/61511955/1083697 by Yong Wang
	function waitForElement(selector) {
		return new Promise(resolve => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector));
			}
			const observer = new MutationObserver(mutations => {
				if (document.querySelector(selector)) {
					resolve(document.querySelector(selector));
					observer.disconnect();
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		});
	}

	function createPostsSelector() {
		// "Lights out" = dark theme
		const darkThemeSelector = '.css-901oao.css-1hf3ou5.r-1bwzh9t.r-37j5jr.r-n6v787.r-16dba41.r-1cwl3u0.r-bcqeeo.r-qvutc0';
		const dimThemeSelector = '.css-901oao.css-1hf3ou5.r-115tad6.r-37j5jr.r-n6v787.r-16dba41.r-1cwl3u0.r-bcqeeo.r-qvutc0';
		// "Default" = light theme
		const lightThemeSelector = '.css-901oao.css-1hf3ou5.r-14j79pv.r-37j5jr.r-n6v787.r-16dba41.r-1cwl3u0.r-bcqeeo.r-qvutc0';
		return `${darkThemeSelector}, ${dimThemeSelector}, ${lightThemeSelector}`;
	}

	/*
	 * Replaces all tab icons, shortcut icons, and favicons
	 * with given `newUrl`.
	 */
	function setFavicon(newUrl) {
		const faviconNodes = document.querySelectorAll(FAVICON_SELECTOR);
		if (!faviconNodes || faviconNodes.length == 0) {
			error("Cannot find favicon elements.");
			return;
		}
		info("New URL", newUrl);
		faviconNodes.forEach(node => {
			info("Replacing old URL =", node.href);
			node.href = newUrl;
		});
	}

	/*
	 * From https://userstyles.world/style/11077/old-twitter-logo
	 * by sapondanaisriwan.
	 * License: MIT.
	 */
	function replaceLogoInHeader() {
		GM_addStyle(`
			[d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"],
			[d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246zm0 0"] {
				d: path("M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z");
				fill: #1DA1F2;
    			}
		`);
	}

	function replaceTabName() {
		if (document.title == "X") {
			document.title = "Twitter";
		} else {
			if (document.title.endsWith("/ X")) {
				document.title = document.title.replace("/ X", "/ Twitter");
			}
		}
	}

	/*
	 * Replaces text "123 posts" with "123 tweets" on user profile pages.
	 */
	function renameTweets() {
		waitForElement(POSTS_SELECTOR).then(postsElement => {
			try {
				const s = postsElement.innerText;
				const m = s.match('([0-9]+) posts');
				if (m.length < 2) {
					error("Cannot match posts string", s);
					return;
				}
				postsElement.innerHTML = m[1] + " tweets";
			} catch (e) {
				error("Cannot rename posts to tweets", e);
			}
		});
	}

	function rename() {
		replaceTabName();
		renameTweets();
	}

	function setUpRenamer() {
		let title = document.title;
		const observer = new MutationObserver((mutationsList) => {
			const maybeNewTitle = document.title;
			if (maybeNewTitle != title) {
				info('Title changed:', maybeNewTitle);
				title = maybeNewTitle;
				rename();
			}
		});
		waitForElement('title').then(elem => {
			observer.observe(elem, { subtree: true, characterData: true, childList: true });
		});
		rename();
	}

	rename();
	waitForElement(FAVICON_SELECTOR).then(ignored => {
		setFavicon(TWITTER_2012_ICON_URL);
		replaceLogoInHeader();
		setUpRenamer();
	});
})();
