package images

import (
	"bytes"
	"context"
	"database/sql"
	"image"
	"image/color"
	"image/png"
	"os"
	"strings"

	"github.com/fogleman/gg"
	"github.com/golang/freetype/truetype"
	"golang.org/x/image/font"
	"golang.org/x/image/font/gofont/goregular"
)

const (
	imageWidth  = 1200
	imageHeight = 630
	avatarSize  = 40
	marginX     = 50
)

func GenerateTextPostImage(ctx context.Context, db *sql.DB, title, body, username string) ([]byte, error) {
	title = truncateString(title, 60)
	body = truncateString(body, 150)
	fontPath := "./internal/images/assets/OpenSans-Regular.ttf"
	logoPath := "./internal/images/assets/bulan-logo.png"
	siteName := "bulan.mn"
	username = "@" + username
	dc := gg.NewContext(imageWidth, imageHeight)
	dc.SetColor(color.RGBA{R: 245, G: 245, B: 245, A: 255})
	dc.Clear()

	titleFace, err := loadFontFace(fontPath, 60)
	if err != nil {
		return nil, err
	}
	bodyFace, err := loadFontFace(fontPath, 54)
	if err != nil {
		return nil, err
	}
	usernameFace, err := loadFontFace(fontPath, 24)
	if err != nil {
		return nil, err
	}
	// Calculate positions for lower right corner
	// avatarSize := 80 // or your desired size
	// avatarX := imageWidth - avatarSize - marginX
	avatarY := imageHeight - avatarSize - marginX
	usernameWidth := float64(0)
	for _, r := range username {
		bounds, _, hasGlyph := usernameFace.GlyphBounds(r)
		if hasGlyph {
			usernameWidth += float64(bounds.Max.X-bounds.Min.X) * (float64(usernameFace.Metrics().Height.Round()) / float64(usernameFace.Metrics().Ascent+usernameFace.Metrics().Descent))
		}
	}
	totalWidth := avatarSize + int(usernameWidth) + 100 // Calculate total width
	avatarX := imageWidth - totalWidth - marginX
	usernameX := avatarX + avatarSize + 10

	// avatarBytes, err := getImage(ctx, db, nil, true)
	// Avatar (Circular and Resized)
	// if avatarPath != "" {
	// 	avatarImg, err := gg.LoadImage(avatarPath)
	// 	if err == nil {
	// 		targetSize := avatarSize // Desired avatar size
	// 		resizedAvatar := gg.NewContext(targetSize, targetSize)
	// 		resizedAvatar.DrawImage(avatarImg, 0, 0)
	// 		resizedAvatar = gg.NewContext(targetSize, targetSize)
	// 		resizedAvatar.DrawImage(resizedAvatar.Image().(image.Image), 0, 0)
	// 		resizedAvatar.Scale(float64(targetSize)/float64(avatarImg.Bounds().Dx()), float64(targetSize)/float64(avatarImg.Bounds().Dy()))
	// 		resizedAvatar.DrawImage(avatarImg, 0, 0)

	// 		mask := gg.NewContext(targetSize, targetSize)
	// 		mask.DrawCircle(float64(targetSize/2), float64(targetSize/2), float64(targetSize/2))
	// 		mask.Clip()
	// 		mask.DrawImage(resizedAvatar.Image().(image.Image), 0, 0)

	// 		dc.DrawImage(mask.Image(), avatarX, avatarY)
	// 	}
	// }

	// Username
	dc.SetFontFace(usernameFace)
	dc.SetColor(color.Black)
	dc.DrawString(username, float64(usernameX), float64(avatarY+avatarSize/2+8)) // Vertically centered

	// Lower Left Corner (Logo/Site Icon and Text)
	if logoPath != "" {
		logoImg, err := gg.LoadImage(logoPath)
		if err == nil {
			targetSize := avatarSize // Same size as avatar
			resizedLogo := gg.NewContext(targetSize, targetSize)
			resizedLogo.DrawImage(logoImg, 0, 0)
			resizedLogo = gg.NewContext(targetSize, targetSize)
			resizedLogo.DrawImage(resizedLogo.Image().(image.Image), 0, 0)
			resizedLogo.Scale(float64(targetSize)/float64(logoImg.Bounds().Dx()), float64(targetSize)/float64(logoImg.Bounds().Dy()))
			resizedLogo.DrawImage(logoImg, 0, 0)

			mask := gg.NewContext(targetSize, targetSize)
			mask.DrawCircle(float64(targetSize/2), float64(targetSize/2), float64(targetSize/2))
			mask.Clip()
			mask.DrawImage(resizedLogo.Image().(image.Image), 0, 0)

			dc.DrawImage(mask.Image(), marginX, imageHeight-targetSize-marginX)

			// Site Name Text
			if siteName != "" {
				siteNameFace, err := loadFontFace(fontPath, 24) // Adjust size as needed
				if err == nil {
					dc.SetFontFace(siteNameFace)
					dc.SetColor(color.Black)
					dc.DrawString(siteName, float64(marginX+targetSize+10), float64(avatarY+avatarSize/2+8)) // Vertically centered

				}
			}
		}
	}

	titleLines := 1
	if lengthInRunes(title) > 39 {
		titleLines = 2
	}
	titleHeight := float64(titleFace.Metrics().Height.Round() * titleLines)
	drawText(dc, titleFace, title, marginX, avatarSize+40, imageWidth-2*marginX, 0)
	drawText(dc, bodyFace, body, marginX, avatarSize+80+titleHeight, imageWidth-2*marginX, imageHeight-avatarSize-40-float64(titleFace.Metrics().Height.Round())*1.2-20-marginX)

	img := dc.Image()
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func drawText(dc *gg.Context, face font.Face, text string, x, y, maxWidth, maxHeight float64) {
	dc.SetFontFace(face)
	dc.SetColor(color.Black)
	lines := wrapText(text, face, maxWidth, maxHeight)
	for _, line := range lines {
		dc.DrawString(line, x, y)
		y += float64(face.Metrics().Height.Round()) * 1.2
	}
}

func loadFontFace(fontPath string, size float64) (font.Face, error) {
	if fontPath == "" {
		f, err := truetype.Parse(goregular.TTF)
		if err != nil {
			return nil, err
		}
		return truetype.NewFace(f, &truetype.Options{Size: size}), nil
	}
	fontBytes, err := os.ReadFile(fontPath)
	if err != nil {
		return nil, err
	}
	f, err := truetype.Parse(fontBytes)
	if err != nil {
		return nil, err
	}
	return truetype.NewFace(f, &truetype.Options{Size: size}), nil
}

func lengthInRunes(s string) int {
	runes := []rune(s)
	return len(runes)
}

func truncateString(s string, maxLength int) string {
	runes := []rune(s)
	if len(runes) > maxLength {
		return string(runes[:maxLength]) + "..."
	}
	return s
}

func wrapText(text string, face font.Face, maxWidth float64, maxHeight float64) []string {
	words := strings.Fields(text)
	var lines []string
	var currentLine string
	currentHeight := float64(0)
	lineHeight := float64(face.Metrics().Height.Round()) * 1.2
	scale := float64(face.Metrics().Height.Round()) / float64(face.Metrics().Ascent+face.Metrics().Descent)

	for _, word := range words {
		testLine := currentLine + word + " "
		width := float64(0)
		for _, r := range testLine {
			bounds, _, hasGlyph := face.GlyphBounds(r)
			if hasGlyph {
				width += float64(bounds.Max.X-bounds.Min.X) * scale
			}
		}

		// Add a small tolerance to maxWidth
		if width > maxWidth-500 { // Adjust this tolerance
			if maxHeight != 0 && currentHeight+lineHeight > maxHeight {
				break
			}
			lines = append(lines, currentLine)
			currentLine = word + " "
			currentHeight += lineHeight
		} else {
			wordIndex := strings.Index(text, word)
			if maxHeight != 0 && currentHeight+lineHeight > maxHeight && len(strings.Fields(text))-len(strings.Fields(text[wordIndex:])) == 0 {
				break
			}
			currentLine += word + " "
		}
	}
	if maxHeight == 0 || currentHeight+lineHeight < maxHeight {
		lines = append(lines, currentLine)
	}
	return lines
}
