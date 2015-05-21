Template.chatLeftMenu.created = function () {
    var self = this;
    self.subscribe("dialogs")
    self.autorun(function () {
        $(".filter-dialogs input").val(IM.getFilterDialogsString());
    });
}

Template.chatLeftMenu.helpers({
    channels: function () {
        return Dialogs.find(
            {
                type: DialogTypes.CHANNEL
            }, {sort: {updated: -1}, limit: 4});
    },
    channelsOther: function () {
        return Dialogs.find(
            {
                type: DialogTypes.CHANNEL
            }, {sort: {updated: -1}, skip: 4});
    },
    dialogs: function () {
        var currentDialog = IM.getCurrentDialog();
        var condition = {
            type: DialogTypes.ONE_TO_ONE,
            updated: {$ne: null}
        }
        if (currentDialog) {
            condition = {
                $and: [
                    {type: DialogTypes.ONE_TO_ONE},
                    {$or: [{updated: {$ne: null}}, {_id: currentDialog._id}]}
                ]
            }
        }
        return Dialogs.find(condition, {sort: {updated: -1}, limit: 4});
    },
    dialogsOther: function () {
        var currentDialog = IM.getCurrentDialog();
        var condition = {
            type: DialogTypes.ONE_TO_ONE,
            updated: {$ne: null}
        }
        if (currentDialog) {
            condition = {
                $and: [
                    {type: DialogTypes.ONE_TO_ONE},
                    {$or: [{updated: {$ne: null}}, {_id: currentDialog._id}]}
                ]
            }
        }
        return Dialogs.find(condition, {sort: {updated: -1}, skip: 4});
    },
    rooms: function () {
        return Dialogs.find(
            {
                type: DialogTypes.ROOM
            }, {sort: {updated: -1}, limit: 4});
    },
    roomsOther: function () {
        return Dialogs.find(
            {
                type: DialogTypes.ROOM
            }, {sort: {updated: -1}, skip: 4});
    },
    canCreateChannels: function () {
        return PrivilegesUtils.canCreateChannels();
    },
    i18nDialogs: function () {
        return '私聊';
    },
    i18nRooms: function () {
        return '群聊';
    },
    i18nChannels: function () {
        return '广播';
    },
    i18nShowMore: function () {
        return '演示更多';
    },
    i18nNoMore: function () {
        return '没有任何';
    },
    i18nSearchDialogs: function () {
        return '搜索聊天';
    }
});
Template.chatLeftMenu.events({
    "click .chat-left-menu": function (e) {
        var $tgt = $(e.target);
        if ($tgt.is(".drop-up") || $tgt.is(".expandable-toggle")) {
            var $expandable = $tgt.closest(".expandable");
            $expandable.closest(".other-dialogs").toggleClass("hidden")
            $expandable.slideUp("slow");
        } else if ($tgt.is('.expand-title')) {
            var $moreRooms = $tgt.closest(".other-dialogs");
            $moreRooms.toggleClass("hidden");
            $moreRooms.find(".expandable").slideDown("slow");
        }


        if($tgt.closest(".create-conversation").length) {
            GlobalUI.closeLeftMenu();
        }
    },
    "click .chat-left-menu .create-channel": function (e) {
        GlobalUI.showDialog({
            data: {
                type: DialogTypes.CHANNEL
            },
            maxWidth: 400,
            heading: "New Channel",
            template: 'createDialog'
        })
    },
    "click .chat-left-menu .create-room": function (e) {
        GlobalUI.showDialog({
            data: {
                type: DialogTypes.ROOM
            },
            heading: "New Room",
            maxWidth: 400,
            template: 'createDialog'
        })
    },
    "input .filter-dialogs": function (e) {
        IM.setDialogsFilterString($(e.target).val());
    }
});


