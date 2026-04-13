require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.static(__dirname));

const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!GOOGLE_VISION_API_KEY) {
    throw new Error('GOOGLE_VISION_API_KEY가 .env에 없습니다.');
}

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY가 .env에 없습니다.');
}

const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});

const PROMPT_A = `
7차-4
"너는 감정이 완벽히 배제된 **'행동 관찰 카메라'**이자, 사실 관계만 건조하게 기록하는 **'법의학자(Forensic Investigator)'**다. 학생의 행동에 어떤 긍정적인 의미나 가치도 부여하지 마라. 오직 '물리적으로 어떤 행동을 했는가'만 CCTV를 보듯 서술하라."(특정 직업이나 전공을 추천하는 진로 상담가가 절대 아님을 명심하라.) 뻔한 칭찬을 배제하고, 어떤 환경에서도 반복되는 학생 본연의 작동 방식을 객관적이고 공감 가는 언어로 도출하라. 문장 자체는 건조하지 않고 사람의 매력이 은은하게 묻어나는 흡인력 있는 톤을 유지하라.

[분석 프로세스]
[1단계: 노이즈 필터링 및 데이터 전처리 (제외 기준)] 생기부 텍스트에서 다음 조건에 해당하는 문장은 분석 연산에서 완전히 배제(무시)하라.
* 결과 중심 서술: 성적 우수, 단순 발표 완료, 과제 제출 등 학교의 기본 요구사항을 완수했다는 내용.
* 직업/전공 필터: 특정 직업, 희망 전공, 대학 학과 명칭 (본질적인 기질을 가리는 프레이밍 요소를 제거하기 위함).
* 범용 서술어: "~를 이해함", "~에 성실히 참여함", "~능력이 뛰어남" 등 다른 학생에게도 복사/붙여넣기 할 수 있는 교사의 주관적이고 추상적인 칭찬.
[2단계: 핵심 데이터 추출 (탐색 기준)] 전처리를 통과한 데이터 중, 다음 3가지 영역에서 학생의 '구체적인 행동 동사'와 '작업 방식'을 추출하라.
* 자발적 과몰입: 점수/평가와 무관하게 굳이 에너지를 더 쏟거나, 스스로 추가 행동을 진행한 내역.
* 초기 세팅 방식: 룰이나 형식이 정해지지 않은 자유 과제(동아리, 모둠, 자율활동 등)에서 가장 먼저 주도적으로 보인 행동 방식
* 무의식적 반복 디테일: 학급 역할, 봉사, 서로 다른 과목 등 3개 이상의 전혀 다른 맥락에서 일관되게 반복되는 행동 패턴 (교차 검증).
* 강조어의 레이더 활용 (Signal Detection): 생기부 텍스트에서 '탁월한, 훌륭한, 우수한, 완성도 높은' 등의 최상급 긍정 표현이 발견된다면, 이는 해당 문장 안에 학생의 **강력한 핵심 기질이 숨어있다는 1차 신호(가중치)**로 받아들여라.
* 단, 추출 시 분리 원칙: 이 신호를 발견했다면, 해당 문장 안에서 학생이 실제로 한 '구체적 행동과 선택(동사)'만 핀셋처럼 추출하라. 최상급 긍정 표현 자체(탁월한, 훌륭한 등)는 껍데기이므로 최종 결과물을 서술할 때는 절대 가져오지 마라. (동작 예시: "복잡한 실험 과정을 마인드맵으로 정리하는 탁월한 능력을 발휘함" ➡️ '탁월한'을 신호로 감지하여 이 문장을 채택함 ➡️ 최종 서술 시에는 "복잡한 과정을 마인드맵으로 정리함"이라는 행동 패턴만 추출함)
[3단계: 본능(기질) 도출 및 결정적 장면 선정]
* 본능 도출: 수집된 반복 패턴을 바탕으로, 이 학생이 무의식적으로 가장 편안하게 구사하는 '본능 행동 방식(문제 해결 기질)'을 정의하라.
* 결정적 장면: 도출된 기질을 가장 명확하게 증명할 수 있는 단 하나의 구체적인 에피소드를 선정하라. (단, 교사의 지시가 아닌 학생의 자발적 선택이 포함된 장면이어야 함).
[4단계: 통찰력 있는 언어 서술 (출력 가이드라인)]
* 톤앤매너: 지나치게 딱딱한 학술적 용어(예: 위계화)나 가벼운 구어체를 피하고, 분석적이면서도 직관적이면서도 가독성 있는 적정 난이도의 언어를 사용할 것.
* 서술 방식: MBTI식의 뻔한 성격 묘사(예: 리더십이 뛰어난, 꼼꼼한)를 엄격히 금지하고, 세련되면서도 인간적인 '행동 묘사' 위주로 서술할 것.
[5단계: 행동 실험 설계]
* 분석된 기질을 바탕으로, 일상에서 이 학생의 본능이 어떻게 발현되는지 당장 확인해 볼 수 있는 행동 실험(상황 테스트)을 제안하라.

[출력 형식] 
(필수 수행) 내부 연산 프로세스 출력
* A항목을 작성하기 전에, 생기부 전체에서 발견된 유효한 '행동 동사 및 작동 방식'의 후보군을 빠짐없이 모두(최소 5개 이상) 나열하시오.
* 각 후보군이 생기부의 어떤 과목/영역에서 등장했는지 **출현 횟수(교차 검증 횟수)**를 숫자로 기록하시오.
* 이 연산 과정에서 가장 출현 횟수가 높은 상위 3개의 패턴만을 선별하여 아래 B항목에 작성하시오.

A. 핵심 행동 방식 요약
* 뻔한 장점을 배제하고, 이 학생의 고유한 행동 메커니즘을 통찰력 있는 2문장으로 요약한다.
B. 자연스러운 행동 방식 TOP 3
* 행동 네이밍: (이 학생의 문제 해결 방식을 직관적으로 보여주는 세련되고 인간적인 캐릭터 키워드.)
* 본능인 이유: (이 행동이 억지 노력이 아닌 자연스러운 작동 방식임을 입증하는 분석 1줄)
* 결정적 장면: (생기부에서 이 패턴이 튀어나온 가장 강력한 구체적 사례 1개 서술)
* 크로스 체크: (다른 영역에서도 이 원리가 적용되었던 흔적 확인 전부 서술. 최소 3개 이상의 다른 맥락에서 확인되지 않으면 해당 패턴의 신뢰도가 낮음을 명시할 것.)
C. 열정이 날 때/힘이 빠질 때
* [작성 원칙 1: 동어 반복 엄격 금지] B항목에서 도출된 핵심 명사나 동사(예: 구조화, 매칭, 규칙 설계, 시각화 등)를 C항목에서 절대 그대로 재사용하지 마라.
* [작성 원칙 2: 장면(Scene) 묘사] 딱딱한 조건문 대신, 그 기질이 발현되는 **'일상(대학/직장)의 구체적인 한 장면'**으로 번역하여 친한 친구가 옆에서 관찰하고 말해주듯, 현실적이고 공감 가는 상황처럼 서술하라.
* [금지어] "자율성이 주어질 때", "창의력을 발휘할 때", "권한이 주어질 때" 등 뻔한 비즈니스/HR 용어 금지.
[나는 이럴 때 은근히 도파민이 도는가?] (B의 상위 3가지와 매칭되는 3가지 상황)
* (나쁜 예 - 단어 복사): "산발적인 정보를 시각적으로 구조화할 때"
* (좋은 예 - 장면 번역): "다들 회의에서 말만 많고 결론이 안 날 때, 슬쩍 화이트보드 앞으로 나가서 엉킨 의견들을 쓱쓱 '표' 하나로 깔끔하게 정리해버리는 순간."
[나는 이럴 때 은근히 지치는가?] (B의 본능적 행동이 완전히 차단되는 답답한 상황 3가지)
* (나쁜 예 - 단어 복사): "관계를 시스템화할 수 없고 감정적으로 대해야 할 때"
* (좋은 예 - 장면 번역): "명확한 룰이나 중재자 없이, 그저 목소리 큰 사람이 쏟아내는 감정적인 불평불만을 중간에서 입 다물고 끝까지 들어주며 억지 리액션만 해야 할 때."
D. 행동 검증 실험 3가지
* 확인 포인트: (확인할 특정 행동 원리)
* 이번주 관찰 미션: (이번 주 일상에서 즉시 확인해 볼수 있는 구체적 행동 1가지)
* 스스로 해볼 질문: (실행 후 스스로 던질 질문 1개)
* 예외 상황: (이런 결과가 나오면 이 패턴이 아닐 가능성이 있다는 반증 기준 1개)

[금지 사항]
* "주도적이다", "리더십이 있다", "탐구력이 뛰어나다" 등 뻔하고 추상적인 단어 금지.
* "위계적 구조화", "인지적 매핑" 등 과도하게 학술적이고 딱딱한 한자어 남용 금지.
* 너무 가볍거나 유치한 구어체 사용 금지.
* 감성적, 문학적, 과장된 수식어 금지.
* 확대 해석 절대 금지
* —예시1: '감정의 메타인지적 조절'(너무 어려움) → '기분 파악을 잘함'(너무 쉬움) → '집단의 정서적 흐름을 읽고, 경직되기 전에 톤을 먼저 바꾸는 습관'(적절함)
* —예시2: '다층적 커뮤니케이션 전략'(너무 어려움) → '쉽게 잘 설명함'(너무 쉬움) → '자기가 이해한 내용을 상대방의 배경지식 수준에 맞춰 다시 풀어서 전달하는 습관'(적절함)
* ‘에너지가 붙는 조건’의 반대말을 자동으로 ‘힘이 빠지는 조건’으로 쓰지 마라. 생기부만으로 직접 확인되지 않은 부정 조건은 단정하지 말고, ‘내 방식이 잘 안 살아나는 조건’ 또는 ‘검증이 필요한 가설’로 표현하라.

[주의]
* 이 결과가 다른 상위권 학생 5명에게도 비슷하게 적용될 수 있다면, 아직 충분히 구별되지 않은 것으로 보고 다시 작성하라.
* 부정 조건은 해당 패턴이 작동하기 위해 필요한 조건이 사라졌을 때를 기준으로 추론하라.
* 부정 조건은 두 단계로 구분하라: ① 생기부에서 간접 단서가 있는 가설 → '단서가 있는 가설'로 표기, ② 패턴의 논리적 역추론인 가설 → '순수 추론'으로 표기.


[학생부 텍스트]
{student_text}
`;

function safeTextPreview(value, max = 500) {
    if (!value) return '없음';
    return String(value).slice(0, max);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGeminiWithRetry(prompt, maxRetries = 2) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Gemini 호출 시도: ${attempt + 1} / ${maxRetries + 1}`);
            console.log('사용 모델:', GEMINI_MODEL);

            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: prompt
            });

            const resultText = response.text || '';

            console.log('Gemini 응답 길이:', resultText.length);
            console.log('Gemini 응답 앞 300자:', safeTextPreview(resultText, 300));

            return resultText;
        } catch (error) {
            lastError = error;

            const errorMessage = String(error?.message || '');
            console.log('Gemini 오류 메시지:', errorMessage);

            const isRetryable =
                errorMessage.includes('"code":503') ||
                errorMessage.includes('"status":"UNAVAILABLE"') ||
                errorMessage.includes('high demand') ||
                errorMessage.includes('"code":429') ||
                errorMessage.includes('"status":"RESOURCE_EXHAUSTED"') ||
                errorMessage.includes('429') ||
                errorMessage.includes('503');

            if (!isRetryable || attempt === maxRetries) {
                throw error;
            }

            const waitMs = Math.min(1500 * Math.pow(2, attempt), 5000);
            console.log(`재시도 대기: ${waitMs}ms`);
            await sleep(waitMs);
        }
    }

    throw lastError;
}

app.post('/ocr', async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({
                error: 'image 값이 없습니다.'
            });
        }

        const requestBody = {
            requests: [
                {
                    image: { content: image },
                    features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
                }
            ]
        };

        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Google Vision API 호출 실패',
                detail: data
            });
        }

        const text = data?.responses?.[0]?.fullTextAnnotation?.text || '';

        console.log('OCR 결과 길이:', text.length);
        console.log('OCR 결과 앞 300자:', safeTextPreview(text, 300));

        return res.json({ text });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'OCR 서버 내부 오류',
            detail: error.message
        });
    }
});

app.get('/test-gemini', async (req, res) => {
    try {
        console.log('===== /test-gemini 시작 =====');

        const resultText = await callGeminiWithRetry('안녕하세요라고만 답하세요.', 2);

        console.log('===== /test-gemini 성공 =====');

        return res.json({
            ok: true,
            model: GEMINI_MODEL,
            result: resultText
        });
    } catch (error) {
        console.error('===== /test-gemini 실패 =====');
        console.error(error);

        return res.status(500).json({
            ok: false,
            error: 'AI 테스트 실패',
            detail: error.message
        });
    }
});

app.post('/analyze-career', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                error: '분석할 text 값이 없습니다.'
            });
        }

        console.log('===== 받은 text 길이 =====');
        console.log(text.length);

        console.log('===== 받은 text 앞 500자 =====');
        console.log(safeTextPreview(text, 500));

        const shortText = text.slice(0, 30000);

        console.log('===== 잘라서 쓸 text 길이 =====');
        console.log(shortText.length);

        const finalPrompt = PROMPT_A.replace('{student_text}', shortText);

        console.log('===== 최종 프롬프트 길이 =====');
        console.log(finalPrompt.length);

        console.log('===== 최종 프롬프트 앞 700자 =====');
        console.log(safeTextPreview(finalPrompt, 700));

        const resultText = await callGeminiWithRetry(finalPrompt, 6);

        return res.json({
            result: resultText
        });
    } catch (error) {
        console.error('===== /analyze-career 실패 =====');
        console.error(error);

        return res.status(500).json({
            error: '분석 실패',
            detail: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.send('OCR + AI 서버 실행 중');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`서버 실행: ${PORT}`);
    console.log('현재 AI 모델:', GEMINI_MODEL);
});
