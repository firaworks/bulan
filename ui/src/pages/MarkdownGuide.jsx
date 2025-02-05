import React from 'react';
import StaticPage from '../components/StaticPage';

const MarkdownGuide = () => {
  return (
    <StaticPage className="page-markdown-guide" title="Маркдаун заавар">
      <div className="document">
        <h1>Маркдаун заавар</h1>
        <p>
          {'Манай сайт '}
          <a href="https://mn.wikipedia.org/wiki/Markdown" target="_blank" rel="noreferrer">
            Маркдаун
          </a>
          {` форматыг дэмждэг бөгөөд энэ нь постууд болон коммэнтууд дээр ажилладаг шүү.`}
          <br />
          {`Та манай сайт дээр `}
          <a href="https://commonmark.org/" target="_blank" rel="noreferrer">
            CommonMark
          </a>
          {' болон '}
          <a href="https://github.github.com/gfm/" target="_blank" rel="noreferrer">
            Github
          </a>
          {'(HTML болон image tag-гүйгээр)-н маркдаун форматуудыг ашиглаж болно.'}
        </p>
        <h2>Энгийн форматууд:</h2>
        <table>
          <thead>
            <tr>
              <th>Үүнийг хийхдээ</th>
              <th>Ингэж хийнэ шүү</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Гарчиг</td>
              <td># гарчиг</td>
            </tr>
            <tr>
              <td>Болд болгох</td>
              <td>**хөөе Болд оо**</td>
            </tr>
            <tr>
              <td>Италик буюу налуу болгох</td>
              <td>*налцгаах уу?*</td>
            </tr>
            <tr>
              <td>Шинэ мөр авах</td>
              <td>Дуусгаж буй мөрний араас 2 удаа зай(<i>space</i>) аваад <i>enter</i> дарна.<br />
                <span style={{ backgroundColor: "gray" }}>Яг ингэж:&nbsp;&nbsp;</span>&lt;-2 удаа зай авсан байгаа биз? +Enter<br /><span style={{ backgroundColor: "gray" }}>Эндээс шинэ мөр эхэлж байна.</span>
              </td>
            </tr>
            <tr>
              <td>Жагсаалт хэлбэрээр оруулах</td>
              <td>
                - нэг юм <br />- хоёр юм
              </td>
            </tr>
            <tr>
              <td>Дугаартай жагсаалт</td>
              <td>
                1. нэг дэх юм<br />
                2. хоёр дахь юм
              </td>
            </tr>
            <tr>
              <td>Тухайн мөрөнд код хэлбэрээр харагдуулах</td>
              <td>`энэ нөгөө keyboard-н 1-н тооны зүүн талд байдаг тэмдэгт шүү`</td>
            </tr>
            <tr>
              <td>Код хэлбэрийн блок оруулж ирэх</td>
              <td>
                ```
                <br />
                нөгөө тэмдэгтээсээ бүр 3-аар эхлээд, 3-аар хаана гэжүгаа...
                <br />
                ```
              </td>
            </tr>
            <tr>
              <td>Линк оруулах</td>
              <td>[линк болж харагдах текст нь](https://mn.wikipedia.org)</td>
            </tr>
            <tr>
              <td>Блок ишлэл</td>
              <td>{'> зөв хүний үйлдэл нүднээс...🥹'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </StaticPage>
  );
};

export default MarkdownGuide;
