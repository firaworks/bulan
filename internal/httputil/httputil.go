// Package httputil provides HTTP utility functions.
package httputil

import (
	"errors"
	"io"
	"net"
	"net/http"
	"slices"
	"time"

	"golang.org/x/net/html"
)

// GetIP returns the IP address associated with r.
func GetIP(r *http.Request) string {
	host, _, _ := net.SplitHostPort(r.RemoteAddr)
	return host
}

var httpClient = &http.Client{
	Timeout: time.Second * 6,
	CheckRedirect: func(req *http.Request, via []*http.Request) error {
		// req.Header.Set("User-Agent", ua)
		return http.ErrUseLastResponse
	},
}

const (
	userAgent = "Mozilla/5.0 (X11; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0"
)

// Get fetches the file at url with an ordinary looking User-Agent. Make sure to
// close the http.Response.Body.
func Get(url string) (resp *http.Response, err error) {
	nextURL := url
	var i int
	for i < 10 {
		resp, err = httpClient.Get(nextURL)
		if err != nil {
			return nil, err
		}
		if resp.StatusCode == 200 {
			return resp, err
		} else {
			nextURL = resp.Header.Get("Location")
			if resp.Request.Host == "www.reddit.com" && resp.StatusCode == 302 {
				// reddit has a weird way of returning 302 upon sucess
				return resp, nil
			}
			i += 1
		}
	}
	if resp == nil {
		return nil, errors.New("exceeded redirects")
	} else {
		return resp, err
	}
}

// ExtractOpenGraphImage returns the Open Graph image tag of the HTML document in r.
func ExtractOpenGraphImage(r io.Reader, sn string) (string, error) {
	doc, err := html.Parse(r)
	if err != nil {
		return "", err
	}

	var f func(*html.Node)
	imageURL := ""
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "meta" {
			for _, meta := range n.Attr {
				if meta.Key == "property" && meta.Val == "og:image" {
					for _, attr := range n.Attr {
						if attr.Key == "content" {
							imageURL = attr.Val
							return
						}
					}
					return
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)

	if sn == "zogii" {
		if imageURL != "" && string([]rune(imageURL)[0]) == "/" {
			imageURL = "https://zogii.mn/" + imageURL
		}
	}
	if sn == "tug" {
		if imageURL != "" && string([]rune(imageURL)[0]) == "/" {
			imageURL = "https://tug.mn/" + imageURL
		}
	}
	if sn == "gogo" {
		// try to extract image from gogo.mn
		var fgogo func(*html.Node)
		fgogo = func(n *html.Node) {
			if sn == "gogo" {
				gogoNewsContainers := []string{"uk-container", "news-cont-container", "news-detail-content-container"}
				href := ""
				if n.Type == html.ElementNode && n.Data == "a" {
					for _, attr := range n.Attr {
						if attr.Key == "href" {
							href = attr.Val
						}
						if attr.Key == "class" && attr.Val == "gogo-zoom" {
							for p := n.Parent; p.Data != "body"; p = p.Parent {
								if len(p.Attr) > 0 && p.Attr[0].Key == "class" && slices.Contains(gogoNewsContainers, p.Attr[0].Val) {
									if href != "" {
										imageURL = href
									}
									return
								}
							}
						}
					}
				}
			}
			for c := n.FirstChild; c != nil; c = c.NextSibling {
				fgogo(c)
			}
		}
		fgogo(doc)
	}
	return imageURL, nil
}

// ExtractOGTItle returns the Open Graph title tag found in the HTML document in r.
func ExtractOpenGraphTitle(r io.Reader) (string, error) {
	doc, err := html.Parse(r)
	if err != nil {
		return "", err
	}

	var f func(*html.Node)
	title := ""
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "meta" {
			for _, meta := range n.Attr {
				if meta.Key == "property" && meta.Val == "og:title" {
					for _, attr := range n.Attr {
						if attr.Key == "content" {
							title = attr.Val
							return
						}
					}
					return
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)

	return title, nil
}

func ProxyRequest(w http.ResponseWriter, r *http.Request, url string) {
	req, err := http.NewRequest(r.Method, url, r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	req.Header = r.Header
	req.Header.Set("User-Agent", userAgent)

	resp, err := httpClient.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	for k, v := range resp.Header {
		w.Header()[k] = v
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
