import React, { useEffect, useRef, useState } from "react";
import * as M from "./Main.style";

import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";

import logo from "../../assets/logo.svg";
import takePicture from "../../assets/takePicture.svg";

import schoolBackImg from "../../assets/dgswback.jpg";
import schoolFrontImg from "../../assets/main.jpg";
import playGroundImg from "../../assets/school.jpg";
import setBackground from "../../assets/setBackground.svg";
import setFilter from "../../assets/setFilter.svg";

//import lupi from "../../assets/lupi.png"
import dinosaur from "../../assets/dinosaur.jpg";
import cb from "../../assets/cb.jpg";
import jjanggu from "../../assets/jjanggu.jpg";
import spongibab from "../../assets/spongibab.jpg";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { imageState } from "../../global/image";

const Main = () => {
  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  // bodypix
  const [bodypixnet, setBodypixnet] = useState();
  // 찍힌 이미지
  const [image, setImage] = useRecoilState(imageState);
  // 배경 이미지
  const [backImage, setBackImage] = useState();

  useEffect(() => {
    bodyPix.load().then((net) => {
      setBodypixnet(net);
    });
  }, []);

  const navigater = useNavigate();
  useEffect(() => {
    if (image.length === 2) {
      navigater("result");
    }
  }, [image]);

  useEffect(() => {
    console.log(backImage);
  }, [backImage]);

  async function drawMask(
    webcam,
    canvas,
    tempCtx,
    tempCanvas,
    originCtx,
    originCanvas,
    context
  ) {
    requestAnimationFrame(() =>
      drawMask(
        webcam,
        canvas,
        tempCtx,
        tempCanvas,
        originCtx,
        originCanvas,
        context
      )
    );
    const segmentation = await bodypixnet.segmentPerson(webcam);
    const mask = bodyPix.toMask(segmentation);
    tempCtx.putImageData(mask, 0, 0);

    // 웹캠을 저장
    originCtx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
    originCtx.save();
    originCtx.globalCompositeOperation = "destination-out";
    originCtx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    originCtx.restore();

    // 진짜 ctx를 초기화
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (backImage) {
      context.drawImage(backImage, 0, 0, canvas.width, canvas.height);
    }
    context.drawImage(originCanvas, 0, 0, canvas.width, canvas.height);
  }

  let req;
  const drawimage = async (webcam, context, canvas) => {
    const originCanvas = document.createElement("canvas");
    originCanvas.width = webcam.videoWidth;
    originCanvas.height = webcam.videoHeight;
    const originCtx = originCanvas.getContext("2d");

    // 똑같은 크기의 켄바스를 만든다
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = webcam.videoWidth;
    tempCanvas.height = webcam.videoHeight;
    const tempCtx = tempCanvas.getContext("2d");

    // (async function drawMask() {
    //   requestAnimationFrame(drawMask);
    //   // tempcanvas에 마스크를 그린다
    //   const segmentation = await bodypixnet.segmentPerson(webcam);
    //   const mask = bodyPix.toMask(segmentation);
    //   tempCtx.putImageData(mask, 0, 0);

    //   // 웹캠을 저장
    //   originCtx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
    //   originCtx.save();
    //   originCtx.globalCompositeOperation = "destination-out";
    //   originCtx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    //   originCtx.restore();

    //   // 진짜 ctx를 초기화
    //   context.clearRect(0, 0, canvas.width, canvas.height);
    //   if (backImage) {
    //     context.drawImage(backImage, 0, 0, canvas.width, canvas.height);
    //   }
    //   context.drawImage(originCanvas, 0, 0, canvas.width, canvas.height);
    // })();
    req = requestAnimationFrame(() =>
      drawMask(
        webcam,
        canvas,
        tempCtx,
        tempCanvas,
        originCtx,
        originCanvas,
        context
      )
    );
  };

  const clickHandler = (backImgName) => {
    const webcam = webcamRef.current.video;
    const canvas = canvasRef.current;
    // 켄바스, 웹캠, 비디오 사이즈를 같게 한다

    webcam.width = canvas.width = webcam.videoWidth;
    webcam.height = canvas.height = webcam.videoHeight;

    const context = canvas.getContext("2d");
    // 켄바스 지우기
    context.clearRect(0, 0, canvas.width, canvas.height);

    // const [webcam,context,canvas] = webcamSetter();

    // 배경 변경
    if (backImgName) {
      const img = new Image();
      img.src = backImgName;
      setBackImage(img);
      // img.onload = () => {
      //   setBackImage(img);
      // };
    } else {
      setBackImage(null);
    }

    // 바디픽서가 없을 땐 에러가 뜨기 때문에
    if (bodypixnet) {
      drawimage(webcam, context, canvas);
      // drawimage(...value);
    }
  };

  // --------- 사진 찍기
  function snapshot() {
    // console.log(
    //   "canvasRef.current.toDataURL",
    //   canvasRef.current.toDataURL("image/jpeg")
    // );

    // setImage((prev) => [...prev, canvasRef.current.toDataURL("image/jpeg")]);
    if (backImage) {
      setImage((prev) => [...prev, canvasRef.current.toDataURL("image/jpeg")]);
    } else {
      // setImage((prev) => [...prev,webcamRef])
      console.log(webcamRef.current.video.toDataURL("image/jpeg"));
    }
  }

  const videoConstraints = {
    // width: "1000px",
    // height: "720px",
    facingMode: "user",
  };

  function resetRAF() {
    cancelAnimationFrame(req);
  }

  return (
    <M.Wrapper>
      <M.CamWrapper>
        <Webcam
          ref={webcamRef}
          audio={false}
          width={1280}
          height={720}
          screenshotFormat="image/jpeg"
          className="webcam"
          //   videoConstraints={videoConstraints}
        />
        <canvas ref={canvasRef} className="canvas" />
      </M.CamWrapper>
      <M.ButtonWrapper>
        <M.Header>
          <M.HeaderImg src={logo}></M.HeaderImg>
        </M.Header>
        <div>
          <div>
            <M.TextImg src={setBackground}></M.TextImg>
            <div>
              <M.Button onClick={() => clickHandler(dinosaur)}>
                쥬라기 스쿨
              </M.Button>
              <M.Button onClick={() => clickHandler(spongibab)}>
                스폰지밥
              </M.Button>
              <M.Button onClick={() => clickHandler(playGroundImg)}>
                학교 운동장
              </M.Button>
            </div>
          </div>
          <div>
            <div>
              <M.Button onClick={() => clickHandler(schoolFrontImg)}>
                학교 기숙사동
              </M.Button>
              <M.Button onClick={() => clickHandler(schoolBackImg)}>
                학교 크로마키
              </M.Button>
              <M.Button onClick={() => clickHandler(cb)}>벚꽃</M.Button>
            </div>
          </div>
        </div>
        <div>
          <M.TextImg2 src={setFilter}></M.TextImg2>
          <div>
            <M.Button onClick={() => clickHandler(dinosaur)}>
              쥬라기 스쿨
            </M.Button>
            <M.Button onClick={() => clickHandler(jjanggu)}>짱구</M.Button>
            <M.Button onClick={() => clickHandler(playGroundImg)}>
              학교 운동장
            </M.Button>
          </div>
        </div>

        {/* <M.Button onClick={() => resetRAF()}>배경 없애기</M.Button> */}
        <M.TakeButton
          src={takePicture}
          onClick={() => snapshot()}
        ></M.TakeButton>
        <img src={takePicture} onClick={() => snapshot()}></img>
        <M.TakeButton src={takePicture}></M.TakeButton>
        {/* {
            image.map((e,idx) => (
                <img src={e} key={idx} />
            ))
        } */}
      </M.ButtonWrapper>
    </M.Wrapper>
  );
};

export default Main;
