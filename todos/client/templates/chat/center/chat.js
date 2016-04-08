MESSAGES_READY_EVENT = "MESSAGES_READY_EVENT";
Template.chat.onCreated(function () {
	var self = this;
	self.messagesOnPage = new ReactiveVar(50);
	self.messagesSkipped = new ReactiveVar(0);
	self.inverted = false;
	self.isReady = new ReactiveVar(false);
	self.loadingNew = new ReactiveVar(false);
	self.loadingOld = new ReactiveVar(false);

	self.autorun(function () {
		if (IM.getCurrentDialogId() !== self.dialogId) {
			self.messagesSkipped.set(0);
			self.messagesOnPage.set(50);
			self.isReady.set(false);
			self.inverted = false;
			self.dialogId = IM.getCurrentDialogId();
			self.readController && self.readController.pause();
			if (self.dialogId) {
				self.scrollController && self.scrollController.destroy();
				var unreadCount = IM.unreadMessagesForDialogsMap[self.dialogId];
				if (unreadCount && unreadCount > self.messagesOnPage.get()) {
					var total = IM.messagesCountForDialogMap[self.dialogId];
					self.inverted = true;
					var a = Math.max(total - unreadCount, 0);
					if (a && (a - self.messagesOnPage.get() / 2 > 0)) {
						self.messagesSkipped.set(a - self.messagesOnPage.get() / 2)
					}

				}
			}
		}
		var opts = {
			inverted: self.inverted,
			limit: self.messagesOnPage.get(),
			skip: self.messagesSkipped.get()
		}

		self.subscription = self.subscribe("messages", self.dialogId, opts, function () {
			GlobalUI.closeLeftMenu();
			self.isReady.set(true);
		});
	});

	self.getMessages = function (limit, offset) {
		var limit = limit || self.messagesOnPage.get()
			, offset = offset || self.messagesSkipped.get();

		return Messages.find({
			dialogId: IM.getCurrentDialogId()
		}, {sort: {"created": 1}, limit: limit});
	}
});

Template.chat.onRendered(function () {
	var self = this;
	self.chat = self.$("#chat");
	//to scroll to first unread message. And mark messages "Read"
	self.autorun(function () {
		self.doAfterAllMessagesReady = function () {
			var container = self.$("#messages-container-scroll");
			var messagesWrapper = container.find(".messages");
			var firstUnread = messagesWrapper.find(".chat-message.unread").first();
			if (firstUnread.length) {
				var scrollTop = messagesWrapper.height() - container.height() + firstUnread.position().top;
				container.scrollTop(scrollTop || 1);
			}
		}
		self.doAfterEachMessageReady = null;
		IM.getCurrentDialogId();

		Tracker.nonreactive(function () {
			self.chat.off(MESSAGES_READY_EVENT)
			self.chat.on(MESSAGES_READY_EVENT, function () {
				self.scrollController && self.scrollController.destroy();
				self.scrollController = null;
				self.loadingNew.set(false);
				self.loadingOld.set(false);
				var computationNumber = 0;
				var $messages = self.$("#messages-container-scroll .messages");
				var total = self.getMessages().count();
				self.intervalId = Meteor.setInterval(function () {
					var totalNodes = $messages.children(".chat-message").length;
					if (computationNumber++ >= 10 || total <= totalNodes) {
						Meteor.clearInterval(self.intervalId);
						if (self.doAfterEachMessageReady) {
							self.doAfterEachMessageReady();
						}
						if (self.doAfterAllMessagesReady) {
							self.doAfterAllMessagesReady();
							self.doAfterAllMessagesReady = null;
						}
						if (self.readController) {
							self.readController.resume();
						} else {
							self.readController = new ReadMessageController();
						}
						self.scrollController =
						 new ScrollingController(self.$('#messages-container-scroll'), self);
						self.doAfterEachMessageReady = null;
						self.$('#messages-container-clone').hide();
						self.$('#messages-container-clone').html("");
						self.$('#messages-container-scroll').css({opacity: 1});
					}
				}, 100);
			});
		})
	})
});
Template.chat.onDestroyed(function () {
	var self = this;
	Meteor.clearInterval(self.intervalId);
	self.readController && self.readController.destroy();
	self.scrollController && self.scrollController.destroy();
	self.chat.off();
});

Template.chat.helpers({
	username: function () {
		return Utils.getUsername(Meteor.user());
	},
	currentDialog: function () {
		return IM.getCurrentDialog();
	},
	chatMessages: function () {
		return Template.instance().getMessages();
	},
	currentDialogName: function () {
		return IM.getChatName(IM.getCurrentDialog());
	},
	isNewDialogReady: function () {
		if (IM.getCurrentDialog()) {
			return Template.instance().isReady.get();
		}
	},
	uploadingMessages: function () {
		if (IM.getCurrentDialog()) {
			if (Template.instance().loadingOld.get() || Template.instance().loadingNew.get()) {
				return 1;
			}
		}
		return 0
	}
});

Template.chat.events({
	"click .welcome-btn, click .all-users-button": function (e) {
		$(".chat")[0].togglePanel();
	},
	"click .show-more": function () {
		var current = Template.instance().messagesOnPage.get();
		Template.instance().messagesOnPage.set(current + 50);
	},
	"click .minify-btn": function (e, t) {
		postMessageParent("collapse");
		t.$(".maximize-btn").show();
		t.$(".minify-btn").hide();
		t.$(".all-users-button").hide();
	},
	"click .maximize-btn": function (e, t) {
		postMessageParent("expand");
		t.$(".maximize-btn").hide();
		t.$(".minify-btn").show();
		t.$(".all-users-button").show();
	},
	"mousedown .dialog-menu": function (e, t) {
		postMessageParent("startdrag")
	}
});

