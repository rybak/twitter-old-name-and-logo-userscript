// ==UserScript==
// @name         Twitter: old icon
// @namespace    https://github.com/rybak
// @version      1
// @description  Changes the favicon (tab icon) of Twitter pages back to the old version
// @author       Andrei Rybak
// @license      MIT
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
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

	const LOG_PREFIX = "[Twitter icon]";
	const FAVICON_SELECTOR = 'link[rel="icon"], link[rel="shortcut icon"]';

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

	waitForElement(FAVICON_SELECTOR).then(ignored => {
		setFavicon(TWITTER_2012_ICON_URL);
	});
})();
