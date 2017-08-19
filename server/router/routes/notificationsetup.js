'use strict';

module.exports = (app, db) => {

  // GET all notificationsetups
  app.get('/notificationsetups', (req, res) => {
    db.NotificationSetup.findAll()
      .then(notificationsetups => {
        res.json(notificationsetups);
      });
  });

  // GET one notificationsetup by id
  app.get('/notificationsetup/:id', (req, res) => {
    const id = req.params.id;
    db.NotificationSetup.find({
      where: { uuid: id}
    })
      .then(notificationsetup => {
        res.json(notificationsetup);
      });
  });

  // POST single notificationsetup
  app.post('/notificationsetup', (req, res) => {
	const notifCode = req.body.notifCode;
	const msgTemplate = req.body.msgTemplate;
	const notifLevel = req.body.notifLevel;
	const commTypes = req.body.commTypes;
	console.log(JSON.stringify(req.body));
    db.NotificationSetup.create({
		notifCode: notifCode,
		msgTemplate: msgTemplate,
		notifLevel: notifLevel,
		commTypes: commTypes
    })
    .then(newnotificationsetup => {
		res.json(newnotificationsetup);
	})
  });

  // PATCH single notificationsetup
  app.patch('/notificationsetup/:id', (req, res) => {
    const id = req.params.id;
    const updates = req.body.updates;
    db.NotificationSetup.find({
      where: { uuid: id }
    })
      .then(notificationsetup => {
        return notificationsetup.updateAttributes(updates)
      })
      .then(updatednotificationsetup => {
        res.json(updatednotificationsetup);
      });
  });

  // DELETE single notificationsetup
  app.delete('/notificationsetup/:id', (req, res) => {
    const id = req.params.id;
    db.NotificationSetup.destroy({
      where: { uuid: id }
    })
      .then(deletednotificationsetup => {
        res.json(deletednotificationsetup);
      });
  });
};