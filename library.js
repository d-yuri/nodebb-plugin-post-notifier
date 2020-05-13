'use strict';

const Topics = require.main.require("./src/topics");
const User = require.main.require("./src/user");
const winston = require.main.require('winston');
const aws = require('aws-sdk');
var meta = require.main.require('./src/meta');
const plugin = {};

var ses;
var emailSender;
var forumBaseUrl;
var template;

plugin.init = function (params, callback) {
	const router = params.router;
	const hostMiddleware = params.middleware;

	function render(req, res, next) {
		res.render('admin/plugins/post-notifier', {});
	}

	function getAWSConfig(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION) {
		let myConfig = new aws.Config();

		myConfig.update({
			accessKeyId: AWS_ACCESS_KEY_ID,
			secretAccessKey: AWS_SECRET_ACCESS_KEY,
			region: AWS_REGION
		});

		return myConfig;
	}

	meta.settings.get('post-notifier', function (err, settings) {

		if (!err && settings && settings.region && settings.fromAddress) {
			if (
				settings.accessKeyID
				&& settings.secretAccessKey
				&& settings.region
				&& settings.fromAddress
				&& settings.template
			) {
				ses = new aws.SES(getAWSConfig(settings.accessKeyID, settings.secretAccessKey, settings.region));
				emailSender = settings.fromAddress;
				template = settings.template;
				forumBaseUrl = settings.forumBaseUrl;
			} else {
				winston.error('[post-notifier] Not all settings defined!');
			}

		} else {
			winston.error('[post-notifier] Settings are not configured!');
		}
	});
	router.get('/admin/plugins/post-notifier', params.middleware.admin.buildHeader, render);
	router.get('/api/admin/plugins/post-notifier', render);

	callback();
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/post-notifier',
		icon: 'fa-tint',
		name: 'Post notifier',
	});

	callback(null, header);
};


plugin.postSave = async function (post, callback) {
	let topic = await Topics.getTopicData(post.post.tid);
	let topicCreator = await User.getUserFields(topic.uid, ['email', 'email:confirmed']);

	if (post.post.uid == topic.uid) {
		return;
	}
	let sendTmplate = template;
	let topicLink = forumBaseUrl + '/topic/' + topic.slug;
	let postLink = forumBaseUrl + '/post/' + post.post.pid;

	sendTmplate = sendTmplate.replace('topicTitle', topic.title);
	sendTmplate = sendTmplate.replace('topicLink', topicLink);
	sendTmplate = sendTmplate.replace('postLink', postLink);
	sendTmplate = sendTmplate.replace('postText', post.post.content.split(' ').slice(0,30).join(' ')+'...');

	let params = {
		Source: emailSender,
		Destination: {
			ToAddresses: [topicCreator.email],
		},
		Message: {
			Subject: {
				Data: emailSender,
				Charset: 'UTF-8',
			},
			Body: {
				Html: {
					Data: sendTmplate,
					Charset: 'UTF-8',
				},
			},
		},
	};

	ses
		.sendEmail(params)
		.promise()
		.then((res) => {}, (error) => console.log(error))
		.catch((error) => console.log(error));

	try {

	}catch (e) {
		winston.error('[post-notification] '+ e);
	}
};

module.exports = plugin;
