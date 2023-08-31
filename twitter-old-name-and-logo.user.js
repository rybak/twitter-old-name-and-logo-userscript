// ==UserScript==
// @name         Twitter: bring back old name and logo
// @namespace    https://github.com/rybak
// @version      16.5
// @description  Changes the logo, tab name, and naming of "tweets" on Twitter
// @author       Andrei Rybak
// @license      MIT
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        GM_addStyle
// @run-at       document-body
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

/*
 * Things which surprisingly don't need replacing/renaming as of 2023-08-19:
 *
 *   1. "Scheduled Tweets" are still called "Tweets"
 *   2. Clickable link "Show <number> Tweets", when you have the timeline open for a while.
 *
 * Things deliberately left with the new name:
 *
 *   1. "Post" in "Post Analytics" -- a rarely used feature, don't care.
 *   2. "X Corp." in the copyright line of the "footer" (it's in the right sidebar on the web version)
 *   3. Anything on subdomains: about.twitter.com, developer.twitter.com, etc.
 *   4. Tweets counters in "What's happening". It's algorithmic trash, hide it with https://userstyles.world/style/10864/twitter-hide-trends-and-who-to-follow
 */

(function() {
	'use strict';
	/*
	 * This is needed to replace the very first "X" in <title>, because
	 * proper renaming and the MutationObserver for <title> are going
	 * to be too late to fix it.
	 */
	document.title = "Twitter";

	const TWITTER_2012_ICON_URL = 'https://abs.twimg.com/favicons/twitter.2.ico';

	const LOG_PREFIX = "[old school Twitter]";
	const FAVICON_SELECTOR = 'link[rel="icon"], link[rel="shortcut icon"]';
	const POSTS_SELECTOR = createPostsSelector();
	const DIALOG_TWEET_BUTTON_SELECTOR = 'div[data-testid="tweetButton"] > div > span > span';
	const RETWEETED_SELECTOR = '[data-testid="socialContext"]';

	function error(...toLog) {
		console.error(LOG_PREFIX, ...toLog);
	}

	function warn(...toLog) {
		console.warn(LOG_PREFIX, ...toLog);
	}

	function info(...toLog) {
		console.info(LOG_PREFIX, ...toLog);
	}

	function debug(...toLog) {
		console.debug(LOG_PREFIX, ...toLog);
	}

	// adapted from https://stackoverflow.com/a/61511955/1083697 by Yong Wang
	function waitForElement(selector) {
		return new Promise(resolve => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector));
			}
			const observer = new MutationObserver(mutations => {
				if (document.querySelector(selector)) {
					observer.disconnect();
					resolve(document.querySelector(selector));
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		});
	}

	/*
	 * Tweets/Posts counters in user profiles are weird.  Their nesting/wrapping
	 * depends on the theme and on mobile vs desktop.
	 * By "theme" I mean "More > Settings and Support > Display > Background".
	 */
	function createPostsSelector() {
		// "Lights out" = dark theme
		// const darkThemeSelector   = '.css-901oao.css-1hf3ou5.r-1bwzh9t.r-37j5jr.r-n6v787.r-16dba41.r-1cwl3u0.r-bcqeeo.r-qvutc0';
		// const dimThemeSelector    = '.css-901oao.css-1hf3ou5.r-115tad6.r-37j5jr.r-n6v787.r-16dba41.r-1cwl3u0.r-bcqeeo.r-qvutc0';
		// "Default" = light theme
		// const lightThemeSelector  = '.css-901oao.css-1hf3ou5.r-14j79pv.r-37j5jr.r-n6v787.r-16dba41.r-1cwl3u0.r-bcqeeo.r-qvutc0';
		//                                                     ^^^^^^^^^^
		// <h2> tag = user's name in the header, right above the tweet counter
		const commonDesktopSelector = 'h2 + .css-901oao.css-1hf3ou5.r-37j5jr.r-n6v787.r-16dba41.r-1cwl3u0.r-bcqeeo.r-qvutc0';

		// const fakeMobileSelector = '.css-901oao.css-1hf3ou5.r-1bwzh9t.r-37j5jr.r-n6v787.r-16dba41.r-1cwl3u0.r-bcqeeo.r-qvutc0'; // "Lights out" in mobile emulation in desktop browser
		// const darkMobileSelector = '.css-901oao.css-1hf3ou5.r-1bwzh9t.r-37j5jr.r-1b43r93.r-16dba41.r-14yzgew.r-bcqeeo.r-qvutc0'; // "Lights out" from Firefox Android
		// const  dimMobileSelector = '.css-901oao.css-1hf3ou5.r-115tad6.r-37j5jr.r-1b43r93.r-16dba41.r-14yzgew.r-bcqeeo.r-qvutc0'; // "Dim" from Firefox Android
		// const liteMobileSelector = '.css-901oao.css-1hf3ou5.r-14j79pv.r-37j5jr.r-1b43r93.r-16dba41.r-14yzgew.r-bcqeeo.r-qvutc0'; // "Default" from Firefox Android
		//                                                    ^^^^^^^^^^         ^^^^^^^^^

		const commonMobileSelector = '.css-901oao.css-1hf3ou5.r-37j5jr.r-1b43r93.r-16dba41.r-14yzgew.r-bcqeeo.r-qvutc0';

		return `${commonDesktopSelector}, ${commonMobileSelector}`;
	}

	function replaceLogoOnLoadingScreen() {
		GM_addStyle(`
			#placeholder svg {
				d: path("M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z");
				fill: #1DA1F2;
			}
		`);
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

	function replaceLogo() {
		replaceLogoOnLoadingScreen();
		replaceLogoInHeader();
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

	function renameTwitterInTabName() {
		let t = document.title;
		if (t == "X") {
			t = "Twitter";
		}
		if (t.endsWith("/ X")) {
			t = t.replace("/ X", "/ Twitter");
		}
		if (t.includes(" on X: ")) {
			t = t.replace(" on X: ", " on Twitter: ");
		}
		if (t != document.title) {
			document.title = t;
		}
	}

	/*
	 * Replaces text "123 posts" with "123 tweets" on user profile pages.
	 */
	function renameProfileTweetsCounter() {
		/*
		// Debug code for figuring out CSS selectors for mobile version
		const allDivs = document.querySelectorAll('div');
		for (const div of allDivs) {
			if (div.innerHTML.endsWith('posts')) {
				prompt('Classes ', div.classList);
				return;
			}
		}
		return;
		*/
		waitForElement(POSTS_SELECTOR).then(postsElement => {
			try {
				const s = postsElement.innerText;
				if (s.includes('tweets')) {
					return;
				}
				const m = s.match('([0-9.,KMB]+) posts');
				if (m == null) {
					warn("Cannot match posts string", s);
					return;
				}
				if (m.length < 2) {
					error("Cannot match posts string", s, ". Got " + m.length + " elements in the match");
					return;
				}
				postsElement.innerHTML = m[1] + " tweets";
			} catch (e) {
				error("Cannot rename posts to tweets", e);
			}
		});
	}

	/*
	 * Renames existing "Tweet" buttons in popup dialogs on desktop.
	 */
	function doRenameDialogTweetButton() {
		const newTweetButton = document.querySelector(DIALOG_TWEET_BUTTON_SELECTOR);
		if (newTweetButton == null) {
			return;
		}
		if (newTweetButton.innerText == "Post all") {
			newTweetButton.innerText = "Tweet all";
			debug("DIALOG_TWEET_BUTTON_SELECTOR", newTweetButton);
		} else if (newTweetButton.innerText == "Post") {
			newTweetButton.innerText = "Tweet";
			debug("DIALOG_TWEET_BUTTON_SELECTOR", newTweetButton);
		}
	}

	/*
	 * Button "Tweet" needs to change dynamically into "Tweet all" when
	 * more than two tweets are added to the "draft".
	 *
	 * This observer detects changes in its text, because the button
	 * actually gets recreated inside the popup dialog.
	 */
	let tweetButtonObserver = null;

	/*
	 * Renames various oval blue buttons used to send a tweet, i.e. "to tweet".
	 */
	function renameTweetButton() {
		waitForElement('a[data-testid="SideNav_NewTweet_Button"] > div > span > div > div > span > span').then(tweetButton => {
			if (tweetButton.innerText == "Post") { // avoid renaming "Reply"
				tweetButton.innerHTML = "Tweet";
				debug("SideNav", tweetButton);
			}
		});
		waitForElement(DIALOG_TWEET_BUTTON_SELECTOR).then(tweetButton => {
			tweetButton.innerHTML = "Tweet";
			if (tweetButtonObserver != null) {
				return;
			}
			tweetButtonObserver = new MutationObserver(mutations => {
				doRenameDialogTweetButton();
			});
			/*
			 * Separate observer is needed to avoid leaking `tweetButtonObserver`
			 * and to reconnect `tweetButtonObserver` onto new buttons, when
			 * they appear.
			 */
			const dialogObserver = new MutationObserver(mutations => {
				if (document.querySelector('[role="dialog"]') == null) {
					tweetButtonObserver.disconnect();
					tweetButtonObserver = null;
					info("Disconnected tweetButtonObserver");
					dialogObserver.disconnect();
				}
			});
			tweetButtonObserver.observe(document.querySelector('[role="dialog"]'), { childList: true, subtree: true });
			info("Connected tweetButtonObserver");
			dialogObserver.observe(document.body, { childList: true, subtree: true });
		});
		waitForElement('div[data-testid="tweetButtonInline"] > div > span > span').then(tweetButton => {
			// sometimes this button has the correct text "Reply"
			if (tweetButton.innerText == "Post") {
				debug("tweetButtonInline", tweetButton);
				tweetButton.innerHTML = "Tweet";
			}
		});
	}

	/*
	 * Renames counter of retweets on an individual tweet's page.
	 */
	function renameRetweetsCounter() {
		waitForElement('a[href$="/retweets"] > span > span').then(retweetsCounterElement => {
			retweetsCounterElement.innerHTML = "Retweets";
		});
	}

	/*
	 * Renames "Add another tweet" button (for continuing your own existing thread).
	 */
	function renameAddAnotherTweetButton() {
		waitForElement('main section .css-901oao.css-16my406.css-1hf3ou5.r-poiln3.r-1b43r93.r-1cwl3u0.r-bcqeeo.r-qvutc0 .css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0').then(addAnotherTweetButton => {
			addAnotherTweetButton.innerHTML = "Add another tweet";
		});
	}

	/*
	 * Renames the header on a page for a singular tweet.
	 */
	function renameTweetHeader() {
		waitForElement('h2 > .css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0').then(tweetHeader => {
			if (tweetHeader.innerText == "Post") {
				tweetHeader.innerHTML = "Tweet";
			}
		});
	}

	/*
	 * Note: works only for desktop.
	 */
	function renameDraftEditorPlaceholder(targetText, replacementText, debugMessage) {
		waitForElement('.public-DraftEditorPlaceholder-inner').then(placeholder => {
			if (placeholder.innerText == targetText) {
				placeholder.innerHTML = replacementText;
				debug("Renamed placeholder in", debugMessage);
			}
		});
	}

	/*
	 * Note: works only for mobile.
	 */
	function renameTextAreaAttributePlaceholder(targetText, replacementText) {
		waitForElement(`textarea[placeholder="${targetText}"]`).then(textarea => {
			textarea.setAttribute('placeholder', replacementText);
		});
	}

	/*
	 * Renames a given placeholder `targetText` with `replacementText`.
	 * Works both on desktop (inline and popup dialogs) and on mobile.
	 */
	function renameTweetPlaceholders(targetText, replacementText, debugMessage) {
		// desktop
		renameDraftEditorPlaceholder(targetText, replacementText, debugMessage);
		// mobile
		renameTextAreaAttributePlaceholder(targetText, replacementText);
		/*
		 * TODO: is there some way to detect desktop vs mobile?
		 */
	}

	function renameTweetYourReplyPlaceholder() {
		renameTweetPlaceholders("Post your reply!", "Tweet your reply!", "renameTweetYourReplyPlaceholder");
	}

	function doRenameRetweeted() {
		const allRetweeted = document.querySelectorAll(RETWEETED_SELECTOR);
		let counter = 0;
		for (const retweeted of allRetweeted) {
			if (retweeted.childNodes.length < 3) {
				continue;
			}
			const retweetedText = retweeted.childNodes[2];
			if (retweetedText.textContent == " reposted") {
				retweetedText.remove();
				retweeted.append(" retweeted");
				counter++;
			}
		}
		if (counter > 0) {
			debug(`Renamed fresh ${counter} retweeted text nodes.`);
		}
	}

	/*
	 * Whenever timeline gets recreated/replaced on-the-fly,
	 * we need to wait a bit, until the retweets actually
	 * appear in the document.
	 */
	function renameRetweetedGently() {
		waitForElement(RETWEETED_SELECTOR).then(ignored => {
			doRenameRetweeted();
		});
	}

	let timelineObserver;

	/*
	 * Reconnects the observer for `doRenameRetweeted()` to the timeline node.
	 * This is needed when the page changes completely and a new timeline
	 * node appears in the DOM.
	 */
	function renewRetweetedTimelineObserver() {
		/*
		 * Renaming "Jane Doe retweeted" when you know where these nodes are is easy.
		 * That's the function `doRenameRetweeted()` above.  But keeping track of them
		 * appearing in the timeline is difficult, if you also don't want to waste
		 * CPU unnecessarily.
		 *
		 * The code below kinda works, but the user still sees "reposted" from time
		 * to time.  Any suggestions for improvements are welcome.
		 */
		const selector = 'section.css-1dbjc4n';
		waitForElement(selector).then(timeline => {
			if (timelineObserver != null) {
				timelineObserver.disconnect();
				info("Disconnected timeline observer for doRenameRetweeted()");
			}
			renameRetweetedGently();
			timelineObserver = new MutationObserver((mutationsList) => {
				doRenameRetweeted();
			});
			timelineObserver.observe(document.querySelector(selector), { subtree: true, childList: true });
			info("Added timeline observer for doRenameRetweeted()");
		});
		doRenameRetweeted();
	}

	function renameRetweetLink() {
		waitForElement('[data-testid="retweetConfirm"] span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0').then(retweetLink => {
			/*
			 * TODO: on desktop, this gets called twice, unfortunately.
			 */
			if (retweetLink.innerText == "Repost") {
				retweetLink.innerHTML = "Retweet";
				debug("Renamed 'Retweet' in renameRetweetLink");
			}
		});
	}

	function renameRetweetTooltip() {
		waitForElement('[data-testid="HoverLabel"] span').then(retweetTooltip => {
			if (retweetTooltip.innerText == "Repost") {
				retweetTooltip.innerText = "Retweet";
				debug("Renamed 'Retweet' in renameRetweetTooltip");
			}
		});
	}

	/*
	 * There are at least two affected dropdowns:
	 *   1. "More" under the three dots button in the top right of a tweet
	 *   2. "Share" under the button with "Send" icon (desktop) or
	 *      "Share" icon (mobile) in the bottom right of a tweet.
	 */
	function renameDropdownItems() {
		// Desktop: [data-testid="Dropdown"]
		// Mobile : [data-testid="sheetDialog"]
		waitForElement('#layers [role="menu"]').then(dropdown => {
			/*
			 * TODO: on desktop, this gets called twice, unfortunately.
			 */
			dropdown.querySelectorAll('span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0').forEach(span => {
				if (span.innerText.includes("post")) {
					span.innerHTML = span.innerText.replace("post", "tweet");
					debug("Renamed 'tweet' in renameDropdownItems");
				}
			});
		});
	}

	function renameAddAnotherTweetPlaceholder() {
		renameTweetPlaceholders("Add another post!", "Add another tweet!", "renameAddAnotherTweetPlaceholder");
	}

	let layersObserver;

	/*
	 * #layers is the element where tooltips, dropdown menues, and
	 * popup replies (as opposed to inline replies) are shown.
	 */
	function renewLayersObserver() {
		waitForElement('#layers').then(retweetDropdownContainer => {
			if (layersObserver != null) {
				layersObserver.disconnect();
				layersObserver = null;
				info("Disconnected layersObserver");
			}
			layersObserver = new MutationObserver(mutationsList => {
				renameRetweetLink();
				renameRetweetTooltip();
				renameDropdownItems();
				/*
				 * There are both inline and popup "Reply" fields with placeholders.
				 * This call to renameTweetYourReplyPlaceholder() takes care of the popups.
				 * The call to renameTweetYourReplyPlaceholder() in rename()
				 * takes care of the inline "Reply" fields.
				 */
				renameTweetYourReplyPlaceholder();
				renameAddAnotherTweetPlaceholder();
				doRenameDialogTweetButton();
			});
			layersObserver.observe(retweetDropdownContainer, { subtree: true, childList: true });
			info("Added layersObserver");
		});
	}

	function renameSeeTweetsPill() {
		/*
		 * Several types of "pills":
		 *   - "X, Y, Z posted"
		 *   - "See <number> new posts"
		 */
		waitForElement('[data-testid="pillLabel"] span span span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0').then(pill => {
			if (pill.innerText == "posted") {
				pill.innerHTML = "tweeted";
			}
		});
	}

	function renameTweetInNotifications() {
		/*
		 * This mess of a selector tries to minimize the amount of `spanNodes` that match.
		 */
		const spanNodes = document.querySelectorAll('article div.css-901oao.r-1nao33i.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-1udh08x.r-qvutc0 span span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
		spanNodes.forEach(spanNode => {
			if (spanNode.innerText.includes("post")) {
				let s = spanNode.innerText;
				s = s.replaceAll(" repost", " retweet");
				s = s.replaceAll(" post", " tweet");
				spanNode.innerText = s;
			}
		});
	}

	let notificationsObserver;

	function renewNotificationsObserver() {
		if (document.location.pathname != '/notifications') {
			if (notificationsObserver != null) {
				notificationsObserver.disconnect();
				info("Disconnected notificationsObserver");
			}
			return;
		}
		waitForElement('[aria-label="Timeline: Notifications"]').then(notificationsContainer => {
			notificationsObserver = new MutationObserver(mutationsList => {
				renameTweetInNotifications();
			});
			notificationsObserver.observe(notificationsContainer, { subtree: true, childList: true });
			info("Added notificationsObserver");
		});
	}

	/*
	 * There are four layers to the userscript:
	 *
	 * 1. Big rename in `rename()`, i.e. this function. It gets called
	 *    whenever we suspect that an on-the-fly change of the whole
	 *    page happened.  It calls functions from layers 2 and 3.
	 *    See function `setUpRenamer()` for details.
	 * 2. `MutaitionObserver`s for stuff that gets updated on-the-fly.
	 *    These observers are set up by various `renew...Observer()`
	 *    functions. These observers call functions from layers 3 and 4.
	 * 3. Various `rename<this and that>()` functions, that wait for their
	 *    target element.
	 * 4. Various `doRename<this and that>()` functions, that assume that
	 *    their target element already exists in the document.
	 */
	function rename() {
		// "Tweet" button and tab's <title> are ubiquitous
		renameTweetButton();
		renameTwitterInTabName();

		// targets for renaming on a singular tweet page
		renameTweetHeader();
		renameRetweetsCounter();
		renameTweetYourReplyPlaceholder();

		// target for renaming on a user's profile
		renameProfileTweetsCounter();

		// adding to your own thread
		renameAddAnotherTweetButton();
		renewRetweetedTimelineObserver();

		// timeline + tweets on a timeline
		renewLayersObserver();
		renameSeeTweetsPill();

		renewNotificationsObserver();
	}

	function setUpRenamer() {
		let title = document.title;
		const titleObserver = new MutationObserver((mutationsList) => {
			const maybeNewTitle = document.title;
			if (maybeNewTitle != title) {
				info('Title changed:', maybeNewTitle);
				title = maybeNewTitle;
				if (!title.includes("Twitter") || title.endsWith("/ X")) {
					info("Big renaming: starting...");
					rename();
					info("Big renaming: done ✅");
				}
			}
		});
		waitForElement('title').then(elem => {
			titleObserver.observe(elem, { subtree: true, characterData: true, childList: true });
		});
		rename();
	}

	replaceLogo();
	rename();
	waitForElement(FAVICON_SELECTOR).then(ignored => {
		setFavicon(TWITTER_2012_ICON_URL);
		setUpRenamer();
	});
})();
