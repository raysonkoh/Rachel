import express from "express";
import WorkspaceModel from "../models/Workspace";
import IMeetingParticipant from "../interfaces/IMeetingParticipant";
import IMeeting from "../interfaces/IMeeting";

const userMeetingRoutes = express.Router();

userMeetingRoutes.get("/", (req, res) => {
  const {
    workspaceName,
    userid,
  }: { workspaceName: string; userid: string } = req.body;
  res.json({
    msg: "this is user meeting routes",
    workspaceName,
    userid,
  });
});

/*
    req.body 
        - workspaceName : string
        - userid : string
        - title : string
        - description : string
        - participants : Array<IMeetingParticipant>
        - date: Date
    res.data 
        - msg : string
        - success : boolean
*/
userMeetingRoutes.post("/:meetingid", (req, res) => {
  const {
    workspaceName,
    userid,
    title,
    description,
    participants,
    date,
  }: {
    workspaceName: string;
    userid: string;
    title: string;
    description: string;
    participants: Array<IMeetingParticipant>;
    date: Date;
  } = req.body;

  const meetingid: string = req.params.meetingid;

  const newMeeting: IMeeting = {
    meetingid,
    title,
    description,
    participants,
    date,
  };

  WorkspaceModel.findOne({
    workspaceName,
    "users.userid": userid,
    "meetings.meetingid": meetingid,
  })
    .then((workspace) => {
      if (workspace) {
        // replace in workspace meetings arr
        let replaceIndx = workspace.meetings.findIndex(
          (meeting) => meeting.meetingid === meetingid
        );
        workspace.meetings[replaceIndx] = newMeeting;

        // replace in user meetings arr
        const userMeetingsArr = workspace.users.filter(
          (user) => user.userid === userid
        )[0].meetings;
        replaceIndx = userMeetingsArr.findIndex(
          (meeting) => meeting.meetingid === meetingid
        );
        userMeetingsArr[replaceIndx] = newMeeting;
        workspace.save((err) => {
          if (err) {
            return res.json({
              msg: "An error has occurred while updating meeting",
              success: false,
            });
          } else {
            return res.json({
              msg: `Successfully updated meeting ${meetingid} in ${workspaceName}`,
              success: true,
            });
          }
        });
      } else {
        return res.json({
          msg:
            "Cannot find data matching the workspaceName, userid, and meetingid",
          success: false,
        });
      }
    })
    .catch((err) => res.json({ msg: "An error has occurred", success: false }));
});

/*
    req.body 
        - workspaceName : string
        - userid : string
        - meetingid : string
        - title : string
        - description : string
        - participants : Array<IMeetingParticipant>
        - date: Date
    res.data 
        - msg : string
        - success : boolean     
*/
userMeetingRoutes.post("/", (req, res) => {
  const {
    workspaceName,
    userid,
    meetingid,
    title,
    description,
    participants,
    date,
  }: {
    workspaceName: string;
    userid: string;
    meetingid: string;
    title: string;
    description: string;
    participants: Array<IMeetingParticipant>;
    date: Date;
  } = req.body;

  const newMeeting: IMeeting = {
    meetingid,
    title,
    description,
    participants,
    date,
  };

  WorkspaceModel.findOne({
    workspaceName,
    "users.userid": userid,
  })
    .then((workspace) => {
      if (workspace) {
        // add meeting to the user
        workspace.users
          .filter((user) => user.userid === userid)[0]
          .meetings.push(newMeeting);

        // add meeting to the workspace meeting arr
        workspace.meetings.push(newMeeting);
        workspace.save((err) => {
          if (err) {
            return res.json({
              msg: "An error has occurred while saving new meeting",
              success: false,
            });
          } else {
            return res.json({
              msg: "Successfully saved new meeting",
              success: true,
            });
          }
        });
      } else {
        return res.json({
          msg: "Cannot find data matching the workspaceName and userid",
          success: false,
        });
      }
    })
    .catch((err) => res.json({ msg: "An error has occurred", success: false }));
});

export default userMeetingRoutes;
