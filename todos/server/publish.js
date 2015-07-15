Meteor.publish("userPresences", function () {
    return UserPresences.find();
});
Meteor.publish("allUsers", function () {
    return Meteor.users.find({}, {fields: {username: 1, emails: 1, profile: 1, groups: 1}});
});
Meteor.publish("users", function (opts) {
    var query ={}
    if(opts.hasOwnProperty("searchString") && typeof opts.searchString != "undefined"){
        query.profile.sortName = new RegExp(opts.searchString.toLowerCase());
    }
    return Meteor.users.find(query, {limit: opts.limit, fields: {username: 1, emails: 1, profile: 1, groups: 1}});
});
Meteor.publish("dialogs", function () {
    if (this.userId) {
        return Dialogs.find({$or: [{userIds: {$in: [this.userId]}}, {type: DialogTypes.CHANNEL}]});
    }
    return this.ready();
});
Meteor.publish("readTimestamps", function () {
    if (this.userId) {
        return UserReadTimestamps.find({userId: this.userId});
    }
    return this.ready();
});
Meteor.publish("uploads", function (ids) {
    if (this.userId && ids) {
        return Uploads.find({_id: {$in: ids}});
    }
    return this.ready();
});
Meteor.publish("messages", function (dialogId, opts) {
    if (this.userId && dialogId && opts && opts.limit) {
        check(dialogId, String);
        isUserAuthorizedInDialog(Dialogs.findOne(dialogId), this.userId);
        if(opts.hasOwnProperty("fromDate")){
            var fromDate = opts.fromDate;
            var limit = opts.limit;
            return Messages.find({dialogId: dialogId, created: {$gte: fromDate}}, {sort: {created: 1}, limit: limit, fields: {removedContent: false}});
        } else{
            var limit = opts.limit;
            var skip =  opts.skip || 0;
            if(opts.inverted){
                return Messages.find({dialogId: dialogId}, {sort: {created: 1}, limit: limit, skip:skip,  fields: {removedContent: false}});
            } else {
                return Messages.find({dialogId: dialogId}, {sort: {created: -1}, limit: limit, skip:skip,  fields: {removedContent: false}});
            }
        }

    }
    return this.ready();
});
Meteor.publish("lastDialogMessage", function (dialogId) {
    if (this.userId && dialogId) {
        var self = this;
        check(dialogId, String);
        var dialog = getDialogOrDie(dialogId);
        isUserAuthorizedInDialog(dialog, self.userId)
        return Messages.find({dialogId: dialogId},
            {
                limit: 1,
                sort: {created: -1}
            });

    }
    return this.ready();
});