import express from "express";
import mongoose from "mongoose";
import authRoutes from "./router/routes.js";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middleware/error.js";
import Mines from "./model/mines/sessions.js";
import User from "./model/userSchema.js";
//import http from 'http';
import { Server } from "socket.io";
import PlayHistory from "./model/playHistory.js";
import extra from "./model/extra.js";
import reports from "./model/reports.js";
import promotion from "./model/promotion.js";
import bodyParser from "body-parser";
import salary from "./model/salary.js";
import helmet from "helmet";
import crypto from "crypto";
//console.log(crypto.randomUUID());
// import fs from 'fs'
// import path from 'path';
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE;
var mongoConnected = false;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    mongoConnected = true;
    console.log("Connection Successful");
    
    // TODO: Create MongoDB indexes
    // createIndexes()
    //   .then(result => {
    //     if (result) {
    //       console.log("MongoDB indexes created successfully");
    //     } else {
    //       console.log("Failed to create some MongoDB indexes");
    //     }
    //   })
    //   .catch(err => {
    //     console.error("Error while creating indexes:", err);
    //   });
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
// app.use(checkJwt);
app.set("trust proxy", true);
app.use(helmet());
app.use(express.json({ limit: "20kb" }));

// app.use(bodyParser.json({ limit: '30mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))

// var whitelist = ['https://game.toddapples.com',]
// var corsOptions = {
//   origin: function (origin, callback) {
//     console.log(origin)
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

app.use(cors());
app.use(bodyParser.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use("/user/", authRoutes);
app.use("/", authRoutes);

app.use(errorHandler);
const port = process.env.PORT || 4001;

const localServ = app.listen(port, () => {
  console.log(port);
});




const io = new Server(localServ, { pingTimeout: 60000, cors: { origin: "*" } });
global.socket = io;
io.use(async(socket,next) => {
  const id = socket.handshake.headers.user_id;
  const token = socket.handshake.headers.token;

  const user = await User.findOne({id: id});
       
        if(token === user?.token){
          next();
        }else{
          next(new Error());
        }

 
});
io.on("connection", (socket) => {
  // app.set('socket', socket);
  

  socket.on("setup", (user) => {
    socket.join(user);
    console.log(user.id);
  });

  socket.on("checkOngoing", async (data) => {
    socket.join(data);
    const user = await User.findOne({ id: data.id });
    if (user.token !== data.token) {
      socket.emit("errorOccurred", "Authentication Failed");
      return;
    }

    const getSession = await Mines.findOne({
      userId: data.id,
      status: "OnGoing",
      expired: false,
    });
    if (getSession) {
      socket.emit("checkOngoingPass", {
        id: getSession.id,
        opened: getSession.states.opened,
        amount: getSession.amount,
        current:
          getSession.states.rewards[getSession.states.click - 1] ??
          getSession.amount - (getSession.amount * 2) / 100,
        next: getSession.states.rewards[getSession.states.click],
      });
    } else {
      socket.emit("noSession", "no session");
    }
  });

  socket.on("startGamee", async (data) => {
    socket.join(data);
    const user = await User.findOne({ id: data.id });
    if (user.token !== data.token) {
      socket.emit("errorOccurred", "Authentication Failed");
      return;
    }
    if (user.block) {
      socket.emit("errorOccurred", "Account Suspended");
      return;
    }
    if (data.amount < 10) {
      socket.emit("errorOccurred", "Minimum amount is 10");
      return;
    }
    if (user.balance < data.amount) {
      socket.emit("errorOccurred", "Insufficient funds");
      return;
    }

    var rewards = [];
    var mineLocation = [];
    var amount = data.amount;
    var bidAmount = amount - (amount * 2) / 100;
    if (data.mines === 1) {
      mineLocation = [Math.floor(Math.random() * 25) + 0];

      for (var i = 0; i < 24; i++) {
        if (i === 0) {
          const per = (bidAmount * 10) / 100;
          bidAmount = bidAmount - per;
        } else {
          if (i <= 5) {
            const per = (bidAmount * 7) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 5 && i <= 10) {
            const per = (bidAmount * 8) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 10 && i <= 15) {
            const per = (bidAmount * 10) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 15 && i <= 20) {
            const per = (bidAmount * 13) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 20 && i <= 22) {
            const per = (bidAmount * 20) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 22 && i <= 23) {
            const per = (bidAmount * 100) / 100;
            bidAmount = bidAmount + per;
          }
        }

        rewards.push(bidAmount);
      }
    }
    if (data.mines === 2) {
      function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      }
      const arr = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24,
      ];
      shuffleArray(arr);
      mineLocation.push(arr[0], arr[1]);
      for (var i = 0; i < 23; i++) {
        if (i === 0) {
          const per = (bidAmount * 10) / 100;
          bidAmount = bidAmount - per;
        } else {
          if (i <= 5) {
            const per = (bidAmount * 8) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 5 && i <= 10) {
            const per = (bidAmount * 9) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 10 && i <= 15) {
            const per = (bidAmount * 11) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 15 && i <= 20) {
            const per = (bidAmount * 15) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 20 && i <= 21) {
            const per = (bidAmount * 22) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 21 && i <= 22) {
            const per = (bidAmount * 110) / 100;
            bidAmount = bidAmount + per;
          }
        }

        rewards.push(bidAmount);
      }
    }
    if (data.mines === 3) {
      function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      }
      const arr = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24,
      ];
      shuffleArray(arr);
      mineLocation.push(arr[0], arr[1], arr[2]);
      for (var i = 0; i < 22; i++) {
        if (i === 0) {
          const per = (bidAmount * 10) / 100;
          bidAmount = bidAmount - per;
        } else {
          if (i <= 5) {
            const per = (bidAmount * 9) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 5 && i <= 10) {
            const per = (bidAmount * 10) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 10 && i <= 15) {
            const per = (bidAmount * 12) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 15 && i <= 18) {
            const per = (bidAmount * 18) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 18 && i <= 20) {
            const per = (bidAmount * 25) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 20 && i <= 21) {
            const per = (bidAmount * 120) / 100;
            bidAmount = bidAmount + per;
          }
        }

        rewards.push(bidAmount);
      }
    }
    if (data.mines === 4) {
      function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      }
      const arr = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24,
      ];
      shuffleArray(arr);
      mineLocation.push(arr[0], arr[1], arr[2], arr[3]);
      for (var i = 0; i < 21; i++) {
        if (i === 0) {
          const per = (bidAmount * 10) / 100;
          bidAmount = bidAmount - per;
        } else {
          if (i <= 5) {
            const per = (bidAmount * 12) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 5 && i <= 10) {
            const per = (bidAmount * 13) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 10 && i <= 15) {
            const per = (bidAmount * 15) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 15 && i <= 17) {
            const per = (bidAmount * 20) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 17 && i <= 19) {
            const per = (bidAmount * 30) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 19 && i <= 20) {
            const per = (bidAmount * 140) / 100;
            bidAmount = bidAmount + per;
          }
        }

        rewards.push(bidAmount);
      }
    }
    if (data.mines === 5) {
      function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      }
      const arr = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24,
      ];
      shuffleArray(arr);
      mineLocation.push(arr[0], arr[1], arr[2], arr[3], arr[4]);
      for (var i = 0; i < 20; i++) {
        if (i === 0) {
          const per = (bidAmount * 10) / 100;
          bidAmount = bidAmount - per;
        } else {
          if (i <= 5) {
            const per = (bidAmount * 14) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 5 && i <= 10) {
            const per = (bidAmount * 15) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 10 && i <= 14) {
            const per = (bidAmount * 20) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 14 && i <= 16) {
            const per = (bidAmount * 25) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 16 && i <= 18) {
            const per = (bidAmount * 40) / 100;
            bidAmount = bidAmount + per;
          }
          if (i > 18 && i <= 19) {
            const per = (bidAmount * 200) / 100;
            bidAmount = bidAmount + per;
          }
        }

        rewards.push(bidAmount);
      }
    }

    // if(data.size === 2){
    //   var randNum =  Math.floor(Math.random() * 3) + 0;
    //   for(var i = 0;i < 4;i++){

    //     if(i !== randNum){
    //       list.push({id: i,type: 'coin',open:false,})
    //     }else{
    //       list.push({id: i,type: 'bomb',open:false,})
    //     }

    //   }
    // }

    //user level
    
    const date = new Date();
    const localDate = (date / 1000 + 19800) * 1000;
    const newDate = new Date(localDate);
    const dateFormated = `${
      newDate.getDate() +
      "/" +
      (newDate.getMonth() + 1) +
      "/" +
      newDate.getFullYear()
    }`;




    const bidToday = "bidToday." + `${dateFormated}`;

    const getExtra = await extra.findOne({ id: 1 });
    const lastSes = await Mines.findOne().sort({ date: -1 });

    if (getExtra.mines[`mines${data.mines}`].enable) {
      const min = getExtra.mines[`mines${data.mines}`].min ?? 0;
      var randNum =
        Math.floor(Math.random() * getExtra.mines[`mines${data.mines}`].range) +
        min;
      await Mines.create({
        id: lastSes.id + 1,
        bomb: mineLocation,
        manual: randNum === 0 ? 1 : randNum,
        states: {
          mines: data.mines,
          winning: 0,
          rewards,
          click: 0,
          opened: [],
        },
        userId: data.id,
        amount: data.amount,
        date: Date.now(),
        status: "OnGoing",
        expired: false,
        demo: user.demo ? true : false,
      });
    } else {
      await Mines.create({
        id: lastSes.id + 1,
        bomb: mineLocation,
        states: {
          mines: data.mines,
          winning: 0,
          rewards,
          click: 0,
          opened: [],
        },
        userId: data.id,
        amount: data.amount,
        date: Date.now(),
        status: "OnGoing",
        expired: false,
        demo: user.demo ? true : false,
      });
    }
    await PlayHistory.updateOne(
      { userId: user.id },
      {
        userId: user.id,
        $push: {
          history: {
            amount,
            game: "Mines",
            credit: false,
            date: Date.now(),
            id: lastSes.id + 1,
            note: "play",
          },
        },
      },
      { upsert: true }
    );
    var withWalletAmount = user.withWallet??0;
          var newWithWallet = withWalletAmount + amount;
          if((user.balance - amount) < newWithWallet){
            newWithWallet = (user.balance - amount);
          }
          
    await User.updateOne(
      { id: user.id },
      {withWallet: newWithWallet},
      { $inc: { balance: -amount, [bidToday]: +amount} }
    );
    if (!user.demo)
      await reports.updateOne(
        { id: "minesAuto" },
        {
          id: "minesAuto",
          date: Date.now(),
          game: "mines",
          $inc: { "states.placed": amount, "states.sessions": +1 },
        },
        { upsert: true }
      );
 
    socket.emit("created", {
      id: lastSes.id + 1,
      currentReward: amount - (amount * 2) / 100,
      nextReward: rewards[0],
    });
    return;
  });

  socket.on("stopGame", async (data) => {
    const user = await User.findOne({ id: data.userId });
    if (user.token !== data.token) {
      socket.emit("errorOccurred", "Authentication Failed");
      return;
    }
    const getSession = await Mines.findOne({
      id: data.id,
      expired: false,
      status: "OnGoing",
    });
    if (getSession) {
      var amount;
      const clicks = getSession.states.click;
      const rewards = getSession.states.rewards;

      if (clicks > 0) {
        amount = rewards[clicks - 1];
      } else {
        amount = getSession.amount - (getSession.amount * 10) / 100;
      }
      await User.updateOne({ id: user.id }, { $inc: { balance: amount } });
      await PlayHistory.updateOne(
        { userId: data.userId },
        {
          $push: {
            history: {
              amount,
              game: "Mines",
              credit: true,
              date: Date.now(),
              id: getSession.id,
              note: "cashout",
            },
          },
        }
      );
      await Mines.updateOne(
        { id: getSession.id },
        { expired: true, "states.winning": amount, status: "Cashout" }
      );
      if (!user.demo)
        await reports.updateOne(
          { id: "minesAuto" },
          {
            id: "minesAuto",
            date: Date.now(),
            game: "mines",
            $inc: { "states.cashout": amount, "states.sessionsCashout": +1 },
          },
          { upsert: true }
        );
      socket.emit("cashedOut", { id: getSession.id, amount });
    } else {
      socket.emit("errorOccurred", "Game not found");
    }
  });

  socket.on("click", async (data) => {
    const user = await User.findOne({ id: data.userId });
    if (user.token !== data.token) {
      socket.emit("errorOccurred", "Authentication Failed");
      return;
    }
    const findSession = await Mines.findOne({
      id: data.id,
      expired: false,
    });
    if (!findSession) {
      socket.emit("errorOccurred", "No Game Found");
      return;
    }
    if (findSession.bomb.includes(data.tile.id)) {
      await Mines.updateOne(
        { id: data.id },
        {
          $inc: { "states.click": +1 },
          expired: true,
          status: "Loss",
          $push: { "states.opened": data.tile.id },
        }
      );
      if (!user.demo)
        await reports.updateOne(
          { id: "minesAuto" },
          {
            id: "minesAuto",
            date: Date.now(),
            game: "mines",
            $inc: {
              "states.loss": findSession.amount,
              "states.sessionsLoss": +1,
            },
          },
          { upsert: true }
        );
      socket.emit("gameOver", { bomb: findSession.bomb });
    } else {
      if (findSession.states.opened.includes(data.tile.id)) {
        return;
      } else {
        const putMines = await Mines.findOneAndUpdate(
          { id: data.id },
          {
            $inc: { "states.click": +1 },
            $push: { "states.opened": data.tile.id },
          },
          { new: true }
        );
        if (putMines.states.mines === 1) {
          if (putMines.states.opened.length === 24) {
            await User.updateOne(
              { id: data.userId },
              { $inc: { balance: putMines.states.rewards.at(-1) } }
            );
            await PlayHistory.updateOne(
              { userId: data.userId },
              {
                $push: {
                  history: {
                    amount: putMines.states.rewards.at(-1),
                    game: "Mines",
                    credit: true,
                    date: Date.now(),
                    id: putMines.id,
                    note: "won",
                  },
                },
              }
            );

            await Mines.updateOne(
              { id: putMines.id },
              {
                expired: true,
                status: "Won",
                "states.winning": putMines.states.rewards.at(-1),
              }
            );
            if (!user.demo)
              await reports.updateOne(
                { id: "minesAuto" },
                {
                  id: "minesAuto",
                  date: Date.now(),
                  game: "mines",
                  $inc: {
                    "states.won": putMines.states.rewards.at(-1),
                    "states.sessionsWon": +1,
                  },
                },
                { upsert: true }
              );
            socket.emit("gameWon", {
              bomb: putMines.bomb,
              amount: putMines.states.rewards.at(-1),
            });
          } else {
            if (putMines.manual) {
              if (putMines.states.click >= putMines.manual) {
                await Mines.updateOne(
                  { id: data.id },
                  {
                    $inc: { "states.click": +1 },
                    expired: true,
                    status: "Loss",
                    $push: { "states.opened": data.tile.id },
                  }
                );
                if (!user.demo)
                  await reports.updateOne(
                    { id: "minesAuto" },
                    {
                      id: "minesAuto",
                      date: Date.now(),
                      game: "mines",
                      $inc: {
                        "states.loss": putMines.amount,
                        "states.sessionsLoss": +1,
                      },
                    },
                    { upsert: true }
                  );
                socket.emit("gameOver", { bomb: [data.tile.id] });
              } else {
                socket.emit("clickResponse", {
                  opened: data.tile.id,
                  amount: putMines.amount - (putMines.amount * 2) / 100,
                  current:
                    putMines.states.rewards[putMines.states.click - 1] ?? 0,
                  next: putMines.states.rewards[putMines.states.click],
                  isFirst: putMines.states.click === 1 ? true : false,
                });
              }
            } else {
              socket.emit("clickResponse", {
                opened: data.tile.id,
                amount: putMines.amount - (putMines.amount * 2) / 100,
                current:
                  putMines.states.rewards[putMines.states.click - 1] ?? 0,
                next: putMines.states.rewards[putMines.states.click],
                isFirst: putMines.states.click === 1 ? true : false,
              });
            }
          }
        }
        if (putMines.states.mines === 2) {
          if (putMines.states.opened.length === 23) {
            await User.updateOne(
              { id: data.userId },
              { $inc: { balance: putMines.states.rewards.at(-1) } }
            );
            await PlayHistory.updateOne(
              { userId: data.userId },
              {
                $push: {
                  history: {
                    amount: putMines.states.rewards.at(-1),
                    game: "Mines",
                    credit: true,
                    date: Date.now(),
                    id: putMines.id,
                    note: "won",
                  },
                },
              }
            );

            await Mines.updateOne(
              { id: putMines.id },
              {
                expired: true,
                status: "Won",
                "states.winning": putMines.states.rewards.at(-1),
              }
            );
            if (!user.demo)
              await reports.updateOne(
                { id: "minesAuto" },
                {
                  id: "minesAuto",
                  date: Date.now(),
                  game: "mines",
                  $inc: {
                    "states.won": putMines.states.rewards.at(-1),
                    "states.sessionsWon": +1,
                  },
                },
                { upsert: true }
              );
            socket.emit("gameWon", {
              bomb: putMines.bomb,
              amount: putMines.states.rewards.at(-1),
            });
          } else {
            if (putMines.manual) {
              if (putMines.states.click >= putMines.manual) {
                await Mines.updateOne(
                  { id: data.id },
                  {
                    $inc: { "states.click": +1 },
                    expired: true,
                    status: "Loss",
                    $push: { "states.opened": data.tile.id },
                  }
                );
                if (!user.demo)
                  await reports.updateOne(
                    { id: "minesAuto" },
                    {
                      id: "minesAuto",
                      date: Date.now(),
                      game: "mines",
                      $inc: {
                        "states.loss": putMines.amount,
                        "states.sessionsLoss": +1,
                      },
                    },
                    { upsert: true }
                  );
                socket.emit("gameOver", {
                  bomb: [data.tile.id, putMines.bomb[0]],
                });
              } else {
                socket.emit("clickResponse", {
                  opened: data.tile.id,
                  amount: putMines.amount - (putMines.amount * 2) / 100,
                  current:
                    putMines.states.rewards[putMines.states.click - 1] ?? 0,
                  next: putMines.states.rewards[putMines.states.click],
                  isFirst: putMines.states.click === 1 ? true : false,
                });
              }
            } else {
              socket.emit("clickResponse", {
                opened: data.tile.id,
                amount: putMines.amount - (putMines.amount * 2) / 100,
                current:
                  putMines.states.rewards[putMines.states.click - 1] ?? 0,
                next: putMines.states.rewards[putMines.states.click],
                isFirst: putMines.states.click === 1 ? true : false,
              });
            }
          }
        }
        if (putMines.states.mines === 3) {
          if (putMines.states.opened.length === 22) {
            await User.updateOne(
              { id: data.userId },
              { $inc: { balance: putMines.states.rewards.at(-1) } }
            );
            await PlayHistory.updateOne(
              { userId: data.userId },
              {
                $push: {
                  history: {
                    amount: putMines.states.rewards.at(-1),
                    game: "Mines",
                    credit: true,
                    date: Date.now(),
                    id: putMines.id,
                    note: "won",
                  },
                },
              }
            );

            await Mines.updateOne(
              { id: putMines.id },
              {
                expired: true,
                status: "Won",
                "states.winning": putMines.states.rewards.at(-1),
              }
            );
            if (!user.demo)
              await reports.updateOne(
                { id: "minesAuto" },
                {
                  id: "minesAuto",
                  date: Date.now(),
                  game: "mines",
                  $inc: {
                    "states.won": putMines.states.rewards.at(-1),
                    "states.sessionsWon": +1,
                  },
                },
                { upsert: true }
              );
            socket.emit("gameWon", {
              bomb: putMines.bomb,
              amount: putMines.states.rewards.at(-1),
            });
          } else {
            if (putMines.manual) {
              if (putMines.states.click >= putMines.manual) {
                await Mines.updateOne(
                  { id: data.id },
                  {
                    $inc: { "states.click": +1 },
                    expired: true,
                    status: "Loss",
                    $push: { "states.opened": data.tile.id },
                  }
                );
                if (!user.demo)
                  await reports.updateOne(
                    { id: "minesAuto" },
                    {
                      id: "minesAuto",
                      date: Date.now(),
                      game: "mines",
                      $inc: {
                        "states.loss": putMines.amount,
                        "states.sessionsLoss": +1,
                      },
                    },
                    { upsert: true }
                  );
                socket.emit("gameOver", {
                  bomb: [data.tile.id, putMines.bomb[0], putMines.bomb[1]],
                });
              } else {
                socket.emit("clickResponse", {
                  opened: data.tile.id,
                  amount: putMines.amount - (putMines.amount * 2) / 100,
                  current:
                    putMines.states.rewards[putMines.states.click - 1] ?? 0,
                  next: putMines.states.rewards[putMines.states.click],
                  isFirst: putMines.states.click === 1 ? true : false,
                });
              }
            } else {
              socket.emit("clickResponse", {
                opened: data.tile.id,
                amount: putMines.amount - (putMines.amount * 2) / 100,
                current:
                  putMines.states.rewards[putMines.states.click - 1] ?? 0,
                next: putMines.states.rewards[putMines.states.click],
                isFirst: putMines.states.click === 1 ? true : false,
              });
            }
          }
        }
        if (putMines.states.mines === 4) {
          if (putMines.states.opened.length === 21) {
            await User.updateOne(
              { id: data.userId },
              { $inc: { balance: putMines.states.rewards.at(-1) } }
            );
            await PlayHistory.updateOne(
              { userId: data.userId },
              {
                $push: {
                  history: {
                    amount: putMines.states.rewards.at(-1),
                    game: "Mines",
                    credit: true,
                    date: Date.now(),
                    id: putMines.id,
                    note: "won",
                  },
                },
              }
            );

            await Mines.updateOne(
              { id: putMines.id },
              {
                expired: true,
                status: "Won",
                "states.winning": putMines.states.rewards.at(-1),
              }
            );
            if (!user.demo)
              await reports.updateOne(
                { id: "minesAuto" },
                {
                  id: "minesAuto",
                  date: Date.now(),
                  game: "mines",
                  $inc: {
                    "states.won": putMines.states.rewards.at(-1),
                    "states.sessionsWon": +1,
                  },
                },
                { upsert: true }
              );
            socket.emit("gameWon", {
              bomb: putMines.bomb,
              amount: putMines.states.rewards.at(-1),
            });
          } else {
            if (putMines.manual) {
              if (putMines.states.click >= putMines.manual) {
                await Mines.updateOne(
                  { id: data.id },
                  {
                    $inc: { "states.click": +1 },
                    expired: true,
                    status: "Loss",
                    $push: { "states.opened": data.tile.id },
                  }
                );
                if (!user.demo)
                  await reports.updateOne(
                    { id: "minesAuto" },
                    {
                      id: "minesAuto",
                      date: Date.now(),
                      game: "mines",
                      $inc: {
                        "states.loss": putMines.amount,
                        "states.sessionsLoss": +1,
                      },
                    },
                    { upsert: true }
                  );
                socket.emit("gameOver", {
                  bomb: [
                    data.tile.id,
                    putMines.bomb[0],
                    putMines.bomb[1],
                    putMines.bomb[2],
                  ],
                });
              } else {
                socket.emit("clickResponse", {
                  opened: data.tile.id,
                  amount: putMines.amount - (putMines.amount * 2) / 100,
                  current:
                    putMines.states.rewards[putMines.states.click - 1] ?? 0,
                  next: putMines.states.rewards[putMines.states.click],
                  isFirst: putMines.states.click === 1 ? true : false,
                });
              }
            } else {
              socket.emit("clickResponse", {
                opened: data.tile.id,
                amount: putMines.amount - (putMines.amount * 2) / 100,
                current:
                  putMines.states.rewards[putMines.states.click - 1] ?? 0,
                next: putMines.states.rewards[putMines.states.click],
                isFirst: putMines.states.click === 1 ? true : false,
              });
            }
          }
        }
        if (putMines.states.mines === 5) {
          if (putMines.states.opened.length === 20) {
            await User.updateOne(
              { id: data.userId },
              { $inc: { balance: putMines.states.rewards.at(-1) } }
            );
            await PlayHistory.updateOne(
              { userId: data.userId },
              {
                $push: {
                  history: {
                    amount: putMines.states.rewards.at(-1),
                    game: "Mines",
                    credit: true,
                    date: Date.now(),
                    id: putMines.id,
                    note: "won",
                  },
                },
              }
            );

            await Mines.updateOne(
              { id: putMines.id },
              {
                expired: true,
                status: "Won",
                "states.winning": putMines.states.rewards.at(-1),
              }
            );
            if (!user.demo)
              await reports.updateOne(
                { id: "minesAuto" },
                {
                  id: "minesAuto",
                  date: Date.now(),
                  game: "mines",
                  $inc: {
                    "states.won": putMines.states.rewards.at(-1),
                    "states.sessionsWon": +1,
                  },
                },
                { upsert: true }
              );
            socket.emit("gameWon", {
              bomb: putMines.bomb,
              amount: putMines.states.rewards.at(-1),
            });
          } else {
            if (putMines.manual) {
              if (putMines.states.click >= putMines.manual) {
                await Mines.updateOne(
                  { id: data.id },
                  {
                    $inc: { "states.click": +1 },
                    expired: true,
                    status: "Loss",
                    $push: { "states.opened": data.tile.id },
                  }
                );
                if (!user.demo)
                  await reports.updateOne(
                    { id: "minesAuto" },
                    {
                      id: "minesAuto",
                      date: Date.now(),
                      game: "mines",
                      $inc: {
                        "states.loss": putMines.amount,
                        "states.sessionsLoss": +1,
                      },
                    },
                    { upsert: true }
                  );
                socket.emit("gameOver", {
                  bomb: [
                    data.tile.id,
                    putMines.bomb[0],
                    putMines.bomb[1],
                    putMines.bomb[2],
                    putMines.bomb[3],
                  ],
                });
              } else {
                socket.emit("clickResponse", {
                  opened: data.tile.id,
                  amount: putMines.amount - (putMines.amount * 2) / 100,
                  current:
                    putMines.states.rewards[putMines.states.click - 1] ?? 0,
                  next: putMines.states.rewards[putMines.states.click],
                  isFirst: putMines.states.click === 1 ? true : false,
                });
              }
            } else {
              socket.emit("clickResponse", {
                opened: data.tile.id,
                amount: putMines.amount - (putMines.amount * 2) / 100,
                current:
                  putMines.states.rewards[putMines.states.click - 1] ?? 0,
                next: putMines.states.rewards[putMines.states.click],
                isFirst: putMines.states.click === 1 ? true : false,
              });
            }
          }
        }
      }
    }
  });
});
